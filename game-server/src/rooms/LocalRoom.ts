import { Room, Client, Delayed } from "@colyseus/core";
import GameState from "../models/game-state";
import { formatAsPgnString, parsePgn } from "../server-io";
import { Player } from "../models/game-state";

type TimeOptions = { minutes: number };
export class LocalRoom extends Room<GameState> {
  public whiteInt!: Delayed;
  public blackInt!: Delayed;
  maxClients = 1;

  onCreate(options: TimeOptions) {
    this.setState(new GameState());
    this.state.minutes = options.minutes;

    this.whiteInt = this.clock.setInterval(() => {
      this.state.whiteClock -= 0.1;
    }, 100);

    this.blackInt = this.clock.setInterval(() => {
      this.state.blackClock -= 0.1;
    }, 100);

    this.pauseBothClocks()

    if (options.minutes !== 999999999) {
      const seconds = options.minutes * 60;
      this.state.whiteClock = seconds;
      this.state.blackClock = seconds;
    }

    this.onMessage("move", (client, message) => {
      if (message) {
        const nextState = [...this.state.strMoves, message.move];
        console.log(nextState);
        const pgn = formatAsPgnString(nextState);

        try {
          parsePgn(pgn);
          this.state.strMoves.push(message.move);

          if (options.minutes !== 999999999) {
            if (this.state.strMoves.length % 2 === 0) {
              this.blackInt.pause();
              this.whiteInt.resume();
            } else {
              this.whiteInt.pause();
              this.blackInt.resume();
            }

            this.broadcast("timeUpdate", {
              whiteClock: this.state.whiteClock,
              blackClock: this.state.blackClock,
            });

          }
          if (message.isGameOver) {
            this.state.result = message.result;
            this.state.terminationReason = message.terminationReason;

            this.pauseBothClocks()
          }
        } catch (e) {
          message.send(client, "error", e);
          console.log(`${client} sent invalid move`);
        }
      }
    });

    this.onMessage("draw", () => {
      this.state.result = "1/2-1/2";
      this.state.terminationReason = "draw agreed";

      this.pauseBothClocks()
    });

    this.onMessage("resign", (client, message) => {
      this.state.result = message.result;
      this.state.terminationReason = "resignation";

      this.pauseBothClocks()
    });
  }

  onJoin(client: Client) {
    this.state.players.set(client.sessionId, new Player("Both"));
    console.log(
      "I have arrived!",
      this.state.players.get(client.sessionId).color
    );

    if (this.state.minutes !== 999999999 && !this.state.result) {
      console.log("room minutes:", this.state.minutes);
      this.whiteInt.resume();
      this.blackInt.pause();
    } else if (this.state.result) {
      this.pauseBothClocks()
    }
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

      this.broadcast("timeUpdate", {
        whiteClock: this.state.whiteClock,
        blackClock: this.state.blackClock,
      });

      player.connected = true;
    } catch (error) {
      console.log("no reconnect", error);
      this.state.players.delete(client.sessionId);
    }
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

  pauseBothClocks() {
    this.whiteInt.pause()
    this.blackInt.pause()
  }
}
