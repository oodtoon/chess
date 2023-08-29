import { Room, Client } from "@colyseus/core";
import GameState from "../models/game-state";
import { formatAsPgnString, parsePgn } from "../server-io";
import { PlayerMap } from "../models/game-state";

export class LocalRoom extends Room<GameState> {
  maxClients = 1;

  onCreate() {
    this.setState(new GameState());

    this.onMessage("move", (client, message) => {
      if (message) {
        console.log(
          message.color,
          this.state.players.get(client.sessionId).color
        );

        // if (message.shouldCommit) {
        //   return;
        // }

        if (message.color === "Both") {
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

  onJoin(client: Client) {
    this.state.players.set(client.sessionId, new PlayerMap("Both"));
    console.log(
      "I have arrived!",
      this.state.players.get(client.sessionId).color
    );
  }

  async onLeave(client: Client, consented: boolean) {
    const player = this.state.players.get(client.sessionId);
    console.log(client.sessionId, player.color, "left!");
    player.connected = false;

    try {
      if (consented) {
        console.log("consented leave");
        throw new Error("consented leave");
      }

      await this.allowReconnection(client, 20);
      console.log(client.sessionId, player.color, "reconnected!");
      player.connected = true;
    } catch (error) {
      console.log("no reconnect", error);
      this.state.players.delete(client.sessionId);
    }
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }
}
