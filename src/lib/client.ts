import * as Colyseus from "colyseus.js";

let client = new Colyseus.Client("ws://localhost:2567");

export async function createRoom() {
  const room = await client.create("my_room");
  console.log("joined successfully", room);
  attachStateChangeHandlers(room);
  return room;
}

function attachStateChangeHandlers(room: Colyseus.Room) {
  room.send("move");
  room.onStateChange((state) => {
    console.log(room.name, "has new state:", state);
  });
}
