import { Room, Client } from "@colyseus/core";
import GameState from "../models/game-state";
import { formatAsPgnString, parsePgn } from "../server-io";
import { PlayerMap } from "../models/game-state";

export class MyRoom extends Room<GameState> {
  maxClients = 2;

  onCreate() {
    this.setState(new GameState());

    if (this.state.players)
      this.onMessage("move", (client, message) => {
        if (message) {
          console.log(
            message.color,
            this.state.players.get(client.sessionId).color
          );
          if (message.shouldCommit) {
            return;
          }

          if (
            message.color === this.state.players.get(client.sessionId).color
          ) {
            const nextState = [...this.state.strMoves, message.move];
            console.log(nextState);
            const pgn = formatAsPgnString(nextState);

            try {
              parsePgn(pgn);
              this.state.strMoves.push(message.move);
            } catch (e) {
              message.send(client, "error", e);
              console.log(`${client} sent invalid move`);
            }
          } else {
            this.send(client, "warning", { message: "not your turn" });
            console.log("not your turn!");
          }
        }
      });
  }

  onJoin(client: Client, options: any) {
    let type;
    const colors = ["w", "b"];
    if (this.state.players.size === 0) {
      const colorIndex = Math.floor(Math.random() * colors.length);
      type = colors[colorIndex];
    } else if (this.state.players.size === 1) {
      this.state.players.forEach((value) => {
        if (value.color === "w") {
          type = "b";
        } else {
          type = "w";
        }
      });
    }
    this.state.players.set(client.sessionId, new PlayerMap(type));
  }

  onLeave(client: Client, consented: boolean) {
    console.log(
      client.sessionId,
      this.state.players.get(client.sessionId).color,
      "left!"
    );
    this.state.players.delete(client.sessionId);
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }
}
