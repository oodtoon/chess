import Piece from "./piece";
import Move, { BaseMove, CompoundMove } from "../move";
import type { Square } from "../../type";
import { type } from "@colyseus/schema"

class King extends Piece {
  static startingRows = [0, 7];
  static startingFiles = [4];
  static notation = "K";

  @type("string") name = "King";
  @type("boolean") isChecked = false;

  setChecked() {
    this.isChecked = true;
  }

  setNotChecked() {
    this.isChecked = false;
  }

  countEmptySquares(row: number, from: number, to: number) {
    let count = 0;
    for (let file = from; file < to; file++) {
      if (!this.isSquareOccupied(row, file)) {
        count++;
      }
    }
    return count;
  }

  getAvailableCastlingMoves(): CompoundMove[] {
    if (this.hasMoved) return [];

    const leftSquareCount = this.countEmptySquares(this.row, 1, 4);
    const rightSquareCount = this.countEmptySquares(this.row, 5, 7);

    const leftRook = this.getSquareContent(this.row, 0);
    const rightRook = this.getSquareContent(this.row, 7);

    const castleOptions = [
      {
        rook: leftRook,
        expectedSquares: 3,
        actualSquares: leftSquareCount,
        targetSquare: [this.row, 2],
        rookTargetSquare: [this.row, 3],
        isShort: false,
      },
      {
        rook: rightRook,
        expectedSquares: 2,
        actualSquares: rightSquareCount,
        targetSquare: [this.row, 6],
        rookTargetSquare: [this.row, 5],
        isShort: true,
      },
    ];

    return castleOptions
      .filter(
        ({ rook, expectedSquares, actualSquares }) =>
          actualSquares === expectedSquares &&
          rook?.name === "Rook" &&
          !rook.hasMoved
      )
      .map(
        ({ rook, targetSquare, rookTargetSquare, isShort }) =>
          new CompoundMove(
            Move.fromSquare(targetSquare as Square, this),
            Move.fromSquare(rookTargetSquare as Square, rook!),
            isShort
          )
      );
  }

  computeMoves() {
    const directions = [
      [-1, -1],
      [-1, 1],
      [1, -1],
      [1, 1],
      [0, -1],
      [-1, 0],
      [0, 1],
      [1, 0],
    ];
    const available = directions.flatMap((dir) =>
      this.getLegalDirectionalMoves(dir, 1)
    )

    available.push(...this.getAvailableCastlingMoves());

    return available;
  }

  get icon() {
    return this.isWhite() ? "♔" : "♚";
  }

  onMove(move: BaseMove) {
    super.onMove(move);
  }

  get img() {
    return this.isWhite()
      ? "https://www.chess.com/chess-themes/pieces/neo/150/wk.png"
      : "https://www.chess.com/chess-themes/pieces/neo/150/bk.png";
  }

  get notation() {
    return King.notation;
  }
}

export default King;
