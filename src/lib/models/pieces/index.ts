import Queen from "./queen";
import Knight from "./knight";
import Bishop from "./bishop";
import Rook from "./rook";
import King from "./king";
import Pawn from "./pawn";
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

  //need svelte for this part SVELTY IT UP
  move.player.addLivePiece(promotedPiece);
  return promotedPiece;
}
