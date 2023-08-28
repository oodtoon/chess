import type { Piece } from "$lib/models/pieces";
import { writable, derived } from "svelte/store";
import type Move from "./models/move";

export const selectedPiece = writable<Piece | null>();

export const capturedPiece = writable<Piece>();
export const capturedBlackPieces = writable<Piece[]>([]);
export const capturedWhitePieces = writable<Piece[]>([]);

export const isUndoMove = writable<boolean>(false);

export const moveList = writable<Move[]>([]);

export const ghostMoves = derived(selectedPiece, ($selectedPiece) => {
  if ($selectedPiece?.moves) {
    return $selectedPiece.moves;
  } else {
    return [];
  }
});
