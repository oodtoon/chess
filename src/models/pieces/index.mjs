import Queen from "./queen.mjs"
import Knight from "./knight.mjs"
import Bishop from "./bishop.mjs"
import Rook from "./rook.mjs"
export { default as Piece } from "./piece.mjs";
export { default as Pawn } from "./pawn.mjs";
export { default as King } from "./king.mjs";
export { Queen, Knight, Bishop, Rook }




export function promote(move, type) {
    const pawn = move.initiatingPiece
    move.player.removeLivePiece(pawn);
    move.player.addPromotedPawn(pawn);

    const pieceConstuctors = {
      "Queen": Queen,
      "Knight": Knight,
      "Bishop": Bishop,
      "Rook": Rook,
    };

    const PieceClass = pieceConstuctors[type];
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