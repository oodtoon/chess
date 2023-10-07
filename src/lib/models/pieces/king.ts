import Piece from "./piece";
import Move, { BaseMove, CompoundMove } from "../move";
import type { Square } from "$lib/type";
import type Player from "../player";

class King extends Piece {
  static startingRows = [0, 7];
  static startingFiles = [4];
  static notation = "K";

  name = "King";
  isChecked = false;

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

  isCastleThroughCheck(isShort: boolean) {
    const travelSquares = isShort ? [5, 6] : [2, 3];

    const { livePieces } = this.opponent;
    for (const targetPlayerPiece of livePieces) {
      if (targetPlayerPiece.name !== "King") {
        for (const move of targetPlayerPiece.moves) {
          if (
            move.row === this.row &&
            (move.file === travelSquares[0] || move.file === travelSquares[1])
          ) {
            return true
          } 
        }
      }
    }
    return false
  }

  getAvailableCastlingMoves(): CompoundMove[] {
    if (this.hasMoved || this.isChecked) return [];

    const leftSquareCount = this.countEmptySquares(this.row, 1, 4);
    const rightSquareCount = this.countEmptySquares(this.row, 5, 7);

    const leftRook = this.getSquareContent(this.row, 0);
    const rightRook = this.getSquareContent(this.row, 7);

    const shortSide = this.isCastleThroughCheck(true);
    const longSide = this.isCastleThroughCheck(false);

    const castleOptions = [
      {
        rook: leftRook,
        expectedSquares: 3,
        actualSquares: leftSquareCount,
        targetSquare: [this.row, 2],
        rookTargetSquare: [this.row, 3],
        isShort: false,
        isSeen: longSide,
      },
      {
        rook: rightRook,
        expectedSquares: 2,
        actualSquares: rightSquareCount,
        targetSquare: [this.row, 6],
        rookTargetSquare: [this.row, 5],
        isShort: true,
        isSeen: shortSide,
      },
    ];

    return castleOptions
      .filter(
        ({ rook, expectedSquares, actualSquares, isSeen }) =>
          actualSquares === expectedSquares &&
          rook?.name === "Rook" &&
          !rook.hasMoved &&
          !isSeen
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
    );

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
