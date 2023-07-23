import Queen from "./queen.mjs";
import Knight from "./knight.mjs";
import Bishop from "./bishop.mjs";
import Rook from "./rook.mjs";
import King from "./king.mjs";
import Pawn from "./pawn.mjs";
export { default as Piece } from "./piece.mjs";

export { Queen, Knight, Bishop, Rook, King, Pawn };

export const PIECE_NAME_MAPPING = {
  Queen,
  Knight,
  Bishop,
  Rook,
  King,
  Pawn,
};

export function promote(move, type) {
  const pawn = move.initiatingPiece;
  move.player.removeLivePiece(pawn);
  move.player.addCapturedPiece(pawn);

  const PieceClass = PIECE_NAME_MAPPING[type];
  const promotedPiece = new PieceClass(
    pawn.game,
    pawn.board,
    pawn.player,
    move.row,
    move.file
  );

  move.player.addLivePiece(promotedPiece);
  return promotedPiece;
}
