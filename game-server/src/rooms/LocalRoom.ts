import { Room, Client } from "@colyseus/core";
import GameState from "../models/game-state";
import { formatAsPgnString, parsePgn } from "../server-io";
import { Player } from "../models/game-state";

type TimeOptions = { minutes: string };
export class LocalRoom extends Room<GameState> {
  maxClients = 1;

  onCreate(options: TimeOptions) {
    this.setState(new GameState());
    this.state.minutes = options.minutes
    
    if (options.minutes !== "Unlimited") {
      const numMins = parseInt(options.minutes) * 60;
      this.state.whiteClock = numMins;
      this.state.blackClock = numMins;
    }

    this.onMessage("move", (client, message) => {
      if (message) {
        const nextState = [...this.state.strMoves, message.move];
        console.log(nextState);
        const pgn = formatAsPgnString(nextState);

        try {
          parsePgn(pgn);
          this.state.strMoves.push(message.move);

          if (options.minutes !== "Unlimited") {
            this.state.moveTime = message.moveTime;
            this.state.whiteClock = message.whiteClock;
            this.state.blackClock = message.blackClock;
          }

        } catch (e) {
          message.send(client, "error", e);
          console.log(`${client} sent invalid move`);
        }
      }
    });
  }

  onJoin(client: Client) {
    this.state.players.set(client.sessionId, new Player("Both"));
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

      const rejoinTime = Math.round(Date.now() / 1000);
      const timeDifference = rejoinTime - this.state.moveTime;
      console.log("rejoin", rejoinTime, timeDifference)
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
