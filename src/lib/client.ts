import { Room, Client } from "colyseus.js";
import { get } from "svelte/store";
import { dev } from "$app/environment";
import { PUBLIC_GAME_SERVER_BASE_URL } from "$env/static/public";

let client = new Client(`ws://${import.meta.env.PUBLIC_GAME_SERVER_BASE_URL}`);

export async function createRoom() {
  const room = (await client.create("online_room")) as Room;

  reconnectionToken.set(room.reconnectionToken);
  console.log(room, "created");

  return room;
}

export async function createLocalRoom() {
  const room = (await client.create("local_room")) as Room;

  reconnectionToken.set(room.reconnectionToken);
  console.log("local room", room, "created");

  return room;
}

export async function joinRoom() {
  const room = (await client.join("online_room")) as Room;
  reconnectionToken.set(room.reconnectionToken);
  console.log("joined successfully", room);

  return room;
}

export async function joinPrivateRoom(id: string) {
  const token = get(reconnectionToken);

  try {
    const room = await client.joinById(id);
    reconnectionToken.set(room.reconnectionToken);
    return room;
  } catch {
    console.log("joining new room");
    if (token) {
      try {
        const room = await client.reconnect(token);
        reconnectionToken.set(room.reconnectionToken);
        console.log("reconnected to room");
        return room;
      } catch {}
    }
  }
  window.alert("connection failed");
  throw new Error("connection error");
}

type ReconnectionTokenUpdater = (str: string | null) => string;
type ReconnectionTokenSubscribe = (str: string | null) => void;

const storage = dev ? sessionStorage : localStorage;

export const reconnectionToken = (function () {
  const key = "reconnectionToken";
  const subs: ReconnectionTokenSubscribe[] = [];

  function notify(val: string) {
    subs.forEach((sub) => sub(val));
  }

  return {
    update(updater: ReconnectionTokenUpdater) {
      const currentVal = storage.getItem(key);
      const newVal = updater(currentVal);
      storage.setItem(key, newVal);
      notify(newVal);
    },
    subscribe(subscribeFunc: ReconnectionTokenSubscribe) {
      subs.push(subscribeFunc);
      subscribeFunc(storage.getItem(key));
      return () => {
        const indexToRemove = subs.indexOf(subscribeFunc);
        subs.splice(indexToRemove, 1);
      };
    },
    set(value: string) {
      storage.setItem(key, value);
      notify(value);
    },
  };
})();

console.log(get(reconnectionToken));
