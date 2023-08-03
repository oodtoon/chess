import type { BaseMove } from "../move.js";
import Piece from "./piece.js";

class Knight extends Piece {
  static startingRows = [0, 7];
  static startingFiles = [1, 6];
  static notation = "N";

  name = "Knight";

  computeMoves() {
    const directions = [
      [2, 1],
      [1, 2],
      [-2, 1],
      [-1, 2],
      [-2, -1],
      [-1, -2],
      [2, -1],
      [1, -2],
    ];
    const available = directions.flatMap((dir) =>
      this.getLegalDirectionalMoves(dir, 1)
    );
    return available;
  }

  onMove(move: BaseMove) {
    super.onMove(move);
  }

  get icon() {
    return this.isWhite() ? "♘" : "♞";
  }

  get img() {
    return this.isWhite()
      ? "https://www.chess.com/chess-themes/pieces/neo/150/wn.png"
      : "https://www.chess.com/chess-themes/pieces/neo/150/bn.png";
  }

  get notation() {
    return Knight.notation;
  }
}

export default Knight;
