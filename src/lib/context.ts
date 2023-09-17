import Game from "$lib/models/game";
import { getContext, setContext } from "svelte";
import { writable, type Readable, type Writable, derived } from "svelte/store";
import type { BaseMove } from "./models/move";
import type { GameMode } from "./type";

export type GameContext = {
  game: Writable<Game>;
  moveList: Readable<BaseMove[]>;
  reset: () => void;
  mode: GameMode
};

const contextKey = Symbol();
export const getGameContext = () => getContext<GameContext>(contextKey);
export const setGameContext = (game: Game, mode: GameMode) => {
  const gameStore = writable(game);

  return setContext<GameContext>(contextKey, {
    game: gameStore,
    moveList: derived(gameStore, ($gameStore) => $gameStore.moves),
    reset() {
      gameStore.update(($game) => {
        return new Game($game.eventBus);
      });
    },
    mode
  });
};
