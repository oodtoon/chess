import Queen from "./queen";
import Knight from "./knight";
import Bishop from "./bishop";
import Rook from "./rook";
import King from "./king";
import Pawn from "./pawn";
import type { BaseMove } from "../move";
import type Piece from "./piece";
export { default as Piece } from "./piece";

export { Queen, Knight, Bishop, Rook, King, Pawn };

export const PIECE_NAME_MAPPING = {
  Queen,
  Knight,
  Bishop,
  Rook,
  King,
  Pawn,
};

export type PieceName = keyof typeof PIECE_NAME_MAPPING;

export function promote(move: BaseMove, type: string, isImport: boolean = false) {
  const pawn = move.initiatingPiece as Piece
  move.player.removeLivePiece(pawn);
  move.player.addCapturedPiece(pawn);


  const PieceClass = PIECE_NAME_MAPPING[type as PieceName];
  const promotedPiece = new PieceClass(
    pawn.game,
    pawn.board,
    pawn.player,
    move.row,
    move.file
  );

  if (isImport) {
    move.pieceToPromoteTo = promotedPiece
  }

  //need svelte for this part SVELTY IT UP
  move.player.addLivePiece(promotedPiece);
  return promotedPiece;
}
