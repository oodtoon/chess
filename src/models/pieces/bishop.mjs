import Piece from "./piece.mjs";

class Bishop extends Piece {
  static startingRows = [0, 7];
  static startingFiles = [2, 5];
  static notation = "B"

  name = "Bishop";

  constructor(game, board, player, row, file) {
    super(game, board, player, row, file);
  }

  get moves() {
    const directions = [
      [-1, -1],
      [-1, 1],
      [1, -1],
      [1, 1],
    ];
    const available = directions.flatMap((dir) =>
      this.getLegalDirectionalMoves(dir)
    );

    return available;
;
  }

  onMove(move) {
    super.onMove(move);
  }

  get icon() {
    return this.isWhite() ? "♗" : "♝";
  }

  get img() {
    return this.isWhite() ? "https://www.chess.com/chess-themes/pieces/neo/150/wb.png" : "https://www.chess.com/chess-themes/pieces/neo/150/bb.png"
  }

  get notation() {
    return Bishop.notation
  }
}

export default Bishop;
