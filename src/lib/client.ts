// import * as Colyseus from "colyseus.js";
import { Room, Client } from "colyseus.js";
import { get } from "svelte/store";

let client = new Client("ws://localhost:2567");

export async function createRoom() {
  const room = (await client.create("online_room")) as Room;

  reconnectionToken.set(room.reconnectionToken);
  console.log(room, "created");

  return room;
}

export async function createLocalRoom() {
  const room = (await client.create("local_room")) as Room

  reconnectionToken.set(room.reconnectionToken)
  console.log("local room", room, "created")
  
  return room
}

export async function joinRoom() {
  const room = (await client.join("online_room")) as Room;
  reconnectionToken.set(room.reconnectionToken);
  console.log("joined successfully", room);

  return room;
}

export async function joinPrivateRoom(id: string) {
  const token = get(reconnectionToken);

  if (token) {
    try {
      const room = await client.reconnect(token);
      reconnectionToken.set(room.reconnectionToken);
      console.log("reconnected to room");
      return room;
    } catch {
      console.log("joining new room");
    }
  }
  const room = await client.joinById(id);
  reconnectionToken.set(room.reconnectionToken);
  return room;
}

type ReconnectionTokenUpdater = (str: string | null) => string;
type ReconnectionTokenSubscribe = (str: string | null) => void;

export const reconnectionToken = (function () {
  const key = "session";
  const subs: ReconnectionTokenSubscribe[] = [];

  function notify(val: string) {
    subs.forEach((sub) => sub(val));
  }

  return {
    update(updater: ReconnectionTokenUpdater) {
      const currentVal = localStorage.getItem(key);
      const newVal = updater(currentVal);
      localStorage.setItem(key, newVal);
      notify(newVal);
    },
    subscribe(subscribeFunc: ReconnectionTokenSubscribe) {
      subs.push(subscribeFunc);
      subscribeFunc(localStorage.getItem(key));
      return () => {
        const indexToRemove = subs.indexOf(subscribeFunc);
        subs.splice(indexToRemove, 1);
      };
    },
    set(value: string) {
      localStorage.setItem(key, value);
      notify(value);
    },
  };
})();

console.log(get(reconnectionToken));
