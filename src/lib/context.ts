import type Game from "$lib/models/game";
import { getContext, setContext } from "svelte";
import { writable, type Readable, type Writable, derived } from "svelte/store";
import type { BaseMove } from "./models/move";
import type { Piece } from "./models/pieces";

type GameContext = {
  game: Writable<Game>;
  moveList: Readable<BaseMove[]>;
  capturedWhitePieces: Readable<Piece[] | null[]>;
  capturedBlackPieces: Readable<Piece[] | null[]>;
};

const contextKey = Symbol();
export const getGameContext = () => getContext<GameContext>(contextKey);
export const setGameContext = (game: Game) => {
  const gameStore = writable(game);

  setContext<GameContext>(contextKey, {
    game: gameStore,
    moveList: derived(gameStore, $gameStore => $gameStore.moves),
    capturedWhitePieces: derived(gameStore, $gameStore => $gameStore.whitePlayer.capturedPieces),
    capturedBlackPieces: derived(gameStore, $gameStore => $gameStore.blackPlayer.capturedPieces)
  });
};
