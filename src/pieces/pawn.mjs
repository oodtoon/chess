import Piece from "./piece.mjs"
import Move from "../move.js"

class Pawn extends Piece {
    static startingRows = [1, 6];
    static startingFiles = [0, 1, 2, 3, 4, 5, 6, 7];
  
    name = "Pawn";
  
    constructor(game, board, player, row, file) {
      super(game, board, player, row, file);
      this.hasMoved = false;
      this.hasDoubleMoved = false;
    }
  
    canEnPassant(row, file) {
      const squareContent = this.getSquareContent(row, file);
      const lastMove = this.game.moves.at(-1);
      return (
        this.isValidSquare(row, file) &&
        squareContent &&
        lastMove &&
        lastMove.initiatingPiece === squareContent &&
        lastMove.initiatingPiece.color !== this.color &&
        lastMove.isPawnDoubleMove
      );
    }
  
    get moves() {
      const available = [];
      const direction = this.isWhite() ? 1 : -1;
  
      const firstSquare = [this.row + 1 * direction, this.file];
      if (!this.isSquareOccupied(...firstSquare)) {
        available.push(Move.fromSquare(firstSquare, this));
      }
  
      const secondSquare = [this.row + 2 * direction, this.file];
      if (!this.hasMoved && !this.isSquareOccupied(...secondSquare)) {
        available.push(Move.fromSquare(secondSquare, this));
      }
  
      const leftDiag = [this.row + 1 * direction, this.file - 1];
  
      if (
        this.isValidSquare(...leftDiag) &&
        this.isSquareOccupied(
          ...leftDiag
        ) /*&& this.color !== this.getSquareContent(...leftDiag).color*/
      ) {
        available.push(
          Move.fromSquare(leftDiag, this, this.getSquareContent(...leftDiag))
        );
      }
  
      const rightDiag = [this.row + 1 * direction, this.file + 1];
      if (
        this.isValidSquare(...rightDiag) &&
        this.isSquareOccupied(...rightDiag)
        /*&& this.color !== this.getSquareContent(...leftDiag).color*/
      ) {
        available.push(
          Move.fromSquare(rightDiag, this, this.getSquareContent(...rightDiag))
        );
      }
  
      const leftSquare = [this.row, this.file - 1];
      const rightSquare = [this.row, this.file + 1];
      if (this.canEnPassant(...leftSquare)) {
        available.push(
          Move.fromSquare(leftDiag, this, this.getSquareContent(...leftSquare))
        );
      }
      if (this.canEnPassant(...rightSquare)) {
        available.push(
          Move.fromSquare(rightDiag, this, this.getSquareContent(...rightSquare))
        );
      }
  
      return available;
    }
  
    get icon() {
      return this.isWhite() ? "♙" : "♟";
    }
    onMove(move) {
      this.hasMoved = true;
    }
  }

  export default Pawn