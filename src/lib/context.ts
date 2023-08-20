import type Game from "$lib/models/game";
import { getContext, setContext } from "svelte";
import { writable, type Writable } from "svelte/store";

type GameContext = Writable<{
  game: Game;
}>;

const contextKey = Symbol();
export const getGameContext = () => getContext<GameContext>(contextKey);
export const setGameContext = (game: Game) =>
  setContext<GameContext>(contextKey, writable({ game }));
