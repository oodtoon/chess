import Piece from "./piece";
import Move, { BaseMove } from "../move";
import { intToFile } from "../../util";

class Pawn extends Piece {
  static startingRows = [1, 6];
  static startingFiles = [0, 1, 2, 3, 4, 5, 6, 7];

  static notation = "";


  name = "Pawn";
  hasMoved = false;
  hasDoubleMoved = false;

  canEnPassant(row: number, file: number) {
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

  computeMoves() {
    const available = [];
    const direction = this.isWhite() ? 1 : -1;

    const leftDiag: [number, number] = [this.row + 1 * direction, this.file - 1];

    if (
      this.isValidSquare(...leftDiag) &&
      this.isSquareOccupied(...leftDiag) &&
      this.color !== this.getSquareContent(...leftDiag)?.color
    ) {
      available.push(
        Move.fromSquare(leftDiag, this, this.getSquareContent(...leftDiag))
      );
    }

    const rightDiag: [number, number] = [this.row + 1 * direction, this.file + 1];
    if (
      this.isValidSquare(...rightDiag) &&
      this.isSquareOccupied(...rightDiag) &&
      this.color !== this.getSquareContent(...rightDiag)?.color
    ) {
      available.push(
        Move.fromSquare(rightDiag, this, this.getSquareContent(...rightDiag))
      );
    }

    const leftSquare: [number, number] = [this.row, this.file - 1];
    const rightSquare: [number, number] = [this.row, this.file + 1];
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

    const firstSquare: [number, number] = [this.row + 1 * direction, this.file];

    if (
      this.isValidSquare(...firstSquare) &&
      this.isSquareOccupied(...firstSquare)
    ) {
      return available;
    }

    if (
      this.isValidSquare(...firstSquare) &&
      !this.isSquareOccupied(...firstSquare)
    ) {
      available.push(Move.fromSquare(firstSquare, this));
    }

    const secondSquare: [number, number] = [this.row + 2 * direction, this.file];
    if (!this.hasMoved && !this.isSquareOccupied(...secondSquare)) {
      available.push(Move.fromSquare(secondSquare, this));
    }

    return available;
  }

  get icon() {
    return this.isWhite() ? "♙" : "♟";
  }

  onMove(move: BaseMove) {
    super.onMove(move);
    this.hasMoved = true;
  }

  get img() {
    return this.isWhite()
      ? "https://www.chess.com/chess-themes/pieces/neo/150/wp.png"
      : "https://www.chess.com/chess-themes/pieces/neo/150/bp.png";
  }

  get notation() {
    return intToFile(this.file);
  }
}

export default Pawn;
