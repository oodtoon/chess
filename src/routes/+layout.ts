import { writable } from "svelte/store";
import type { Room } from "colyseus.js";

export const prerender = false;
export const ssr = false;

export function load() {
  return {
    room: writable<Room>(),
    team: writable<"w" | "b">(),
  };
}
