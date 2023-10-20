import { Room, Client, Delayed } from "@colyseus/core";
import GameState from "../models/online-game-state";
import { formatAsPgnString, parsePgn } from "../server-io";
import { Player } from "../models/online-game-state";

type TimeOptions = { minutes: number };

export class OnlineRoom extends Room<GameState> {
  public whiteInt!: Delayed;
  public blackInt!: Delayed;
  maxClients = 2;

  onCreate(options: TimeOptions) {
    this.setState(new GameState());

    this.state.minutes = options.minutes;

    if (options.minutes !== 999999999) {
      const seconds = options.minutes * 60;
      this.state.whiteClock = seconds;
      this.state.blackClock = seconds;
    }

    this.whiteInt = this.clock.setInterval(() => {
      this.state.whiteClock -= 0.1;
    }, 100);

    this.blackInt = this.clock.setInterval(() => {
      this.state.blackClock -= 0.1;
    }, 100);

    if (this.state.players.size < 2 || options.minutes === 999999999) {
      this.pauseBothClocks()
    }

    this.onMessage("move", (client, message) => {
      if (message) {
        console.log(
          message.color,
          this.state.players.get(client.sessionId).color
        );

        if (message.color === this.state.players.get(client.sessionId).color) {
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
              this.state.result = message.result
              this.state.terminationReason = message.terminationReason

              this.pauseBothClocks()
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
      const sender = this.state.players.get(client.sessionId);
      const stateUpdate = {
        ...message,
        hasRequest: true,
        playerColor: sender.color,
      };
      Object.assign(this.state.requestState, stateUpdate);
    });

    this.onMessage("response", (client, message) => {
      this.broadcast("response", message);

      if (message.type === "draw") {
        this.pauseBothClocks()

        this.state.result = "1/2-1/2"
        this.state.terminationReason = "draw"
      }

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
      const sender = this.state.players.get(client.sessionId);
      const resignResult = sender.color === "White" ? "0-1" : "1-0";

      this.state.result = resignResult;
      this.state.terminationReason = "resignation";

      const resignMsg = {
        result: resignResult,
        reason: "resignation",
      };
      this.broadcast("resign", resignMsg);
      this.pauseBothClocks()
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
      if (this.state.minutes !== 999999999) {
        this.whiteInt.resume();
      }
    }
    this.state.players.set(client.sessionId, new Player(type));
  }

  async onLeave(client: Client, consented: boolean) {
    const player = this.state.players.get(client.sessionId);
    console.log(client.sessionId, player.color, "left!");
    player.connected = false;

    this.getOtherClient(client).send("opponentLeft");

    try {
      if (consented) {
        console.log("consented leave");
        throw new Error("consented leave");
      }

      await this.allowReconnection(client, 20);
      console.log(client.sessionId, player.color, "reconnected!");
      const message = { moves: [...this.state.strMoves], result: this.state.result, terminationReason: this.state.terminationReason };
      console.log([...this.state.strMoves]);

      // client.send("rejoin", message);
      this.getOtherClient(client).send("opponentIsBack", message);

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

  private getOtherClient(client: Client) {
    const currentIndex = this.clients.indexOf(client);
    const otherIndex = +!currentIndex;
    return this.clients[otherIndex];
  }

  onDispose() {
    console.log("right now");
    console.log("room", this.roomId, "disposing...");
  }

  pauseBothClocks() {
    this.whiteInt.pause()
    this.blackInt.pause()
  }
}
