import * as Colyseus from "colyseus.js";

let client = new Colyseus.Client("ws://localhost:2567");

export async function createRoom() {
  const room = (await client.create("my_room")) as Colyseus.Room;
  console.log(room, "created")

  return room
}

export async function joinRoom() {
  const room = (await client.join("my_room")) as Colyseus.Room;
  console.log("joined successfully", room);
  attachStateChangeHandlers(room);

  return room;
}

export async function joinPrivateRoom(id: string) {
  console.log("id passed", id)

  client.getAvailableRooms("my_room").then(rooms => {
    rooms.forEach((r) => {
      console.log("this room id", r.roomId)
    })
  })
  const room = (await client.joinById(id)) as Colyseus.Room
  attachStateChangeHandlers(room)
  return room
}

function attachStateChangeHandlers(room: Colyseus.Room) {
  room.send("move");
}
