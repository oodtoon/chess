import type { Piece } from "$lib/models/pieces";
import { writable, derived } from "svelte/store";

export const selectedPiece = writable<Piece | null>();

export const capturedPiece = writable<Piece>();
export const capturedBlackPieces = writable<Piece[] | null[]>([]);
export const capturedWhitePieces = writable<Piece[] | null[]>([]);

export const promotedPieceType = writable<Piece | null>();

export const moveList = writable<string>();

export const ghostMoves = derived(selectedPiece, ($selectedPiece) => {
  if ($selectedPiece?.moves) {
    return $selectedPiece.moves;
  } else {
    return [];
  }
});