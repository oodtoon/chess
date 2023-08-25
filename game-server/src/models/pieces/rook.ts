import type { BaseMove } from "../move";
import Piece from "./piece";
import { type } from "@colyseus/schema"

class Rook extends Piece {
  static startingRows = [0, 7];
  static startingFiles = [0, 7];

  static notation = "R";

  @type("string") name = "Rook";

  get icon() {
    return this.isWhite() ? "♖" : "♜";
  }

  computeMoves() {
    const directions = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ];
    const available = directions.flatMap((dir) =>
      this.getLegalDirectionalMoves(dir)
    );
    return available;
  }

  onMove(move: BaseMove) {
    super.onMove(move);
    this.hasMoved = true;
  }

  get img() {
    return this.isWhite()
      ? "https://www.chess.com/chess-themes/pieces/neo/150/wr.png"
      : "https://www.chess.com/chess-themes/pieces/neo/150/br.png";
  }

  get notation() {
    return Rook.notation;
  }
}

export default Rook;
