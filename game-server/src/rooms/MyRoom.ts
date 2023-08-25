import { Room, Client } from "@colyseus/core";
import Game from "../models/game";


export class MyRoom extends Room<Game> {
  maxClients = 4;

  onCreate (options: any) {
    this.setState(new Game());


    this.onMessage("move", (client, message) => {
      console.log(message)
    });

  }

  onJoin (client: Client, options: any) {
    console.log(client.sessionId, "joined!");
  }

  onLeave (client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

}
