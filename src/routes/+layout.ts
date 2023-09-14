import { writable } from "svelte/store";
import type { Room } from "colyseus.js";
import { abort } from "$lib/components/dialogs";

export const prerender = false;
export const ssr = false;

export function load() {
  return {
    room: writable<Room>(),
    team: writable<"White" | "Black">(),
  };
}


if (import.meta.hot) {
  abort("HMR")
}
