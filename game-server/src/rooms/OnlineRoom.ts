import { Room, Client } from "@colyseus/core";
import GameState from "../models/online-game-state";
import { formatAsPgnString, parsePgn } from "../server-io";
import { Player } from "../models/online-game-state";

type TimeOptions = { minutes: number };

export class OnlineRoom extends Room<GameState> {
  maxClients = 2;

  onCreate(options: TimeOptions) {
    this.setState(new GameState());
    this.state.minutes = options.minutes

    if (options.minutes !== Infinity) {
      const seconds = options.minutes * 60;
      this.state.whiteClock = seconds;
      this.state.blackClock = seconds;
    }

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

              if (options.minutes !== Infinity) {
                this.state.moveTime = message.moveTime;
                this.state.whiteClock = message.whiteClock;
                this.state.blackClock = message.blackClock;
              }
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

    this.onMessage("undoMove", () => {
      this.state.strMoves.pop();
    });

    this.onMessage("request", (client, message) => {
      const stateUpdate = {
        ...message,
        hasRequest: true,
        playerColor: this.state.players.get(client.sessionId).color,
      };
      Object.assign(this.state.requestState, stateUpdate);
    });

    this.onMessage("response", (client, message) => {
      this.broadcast("response", message);

      const requestStateReset = {
        hasRequest: false,
        type: "",
        title: "",
        content: "",
        playerColor: "",
      };
      Object.assign(this.state.requestState, requestStateReset);
    });

    this.onMessage("resign", (client) => {
      const resignResult =
        this.state.players.get(client.sessionId).color === "White"
          ? "0-1"
          : "1-0";
      const resignMsg = {
        result: resignResult,
        reason: "resignation",
      };
      this.broadcast("resign", resignMsg);
    });
  }

  onJoin(client: Client, options: any) {
    console.log("I have arrived!", options);
    let type;
    const colors = ["White", "Black"];
    if (this.state.players.size === 0) {
      const colorIndex = Math.floor(Math.random() * colors.length);
      type = colors[colorIndex];
    } else if (this.state.players.size === 1) {
      this.state.players.forEach((value) => {
        if (value.color === "White") {
          type = "Black";
        } else {
          type = "White";
        }
      });
    }
    this.state.players.set(client.sessionId, new Player(type));
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

      const rejoinTime = Math.round(Date.now() / 1000);
      const timeDifference = rejoinTime - this.state.moveTime;
      console.log("rejoin", rejoinTime, timeDifference);

      this.state.moveTime = rejoinTime
      if (this.state.strMoves.length % 2 === 0) {
        this.state.whiteClock -= timeDifference;
      } else {
        this.state.blackClock -= timeDifference;
      }

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
