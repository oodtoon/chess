import * as Colyseus from "colyseus.js";

let client = new Colyseus.Client("ws://localhost:2567");

export async function createRoom() {
  
  const room = (await client.joinOrCreate("my_room")) as any;
  console.log("joined successfully", room);
  attachStateChangeHandlers(room);

  return room;
}

function attachStateChangeHandlers(room: Colyseus.Room) {
  room.send("move");
}
