import Piece from "./piece.mjs";

class Queen extends Piece {
  static startingRows = [0, 7];
  static startingFiles = [3];
  static notation = "Q";

  name = "Queen";
 

  constructor(game, board, player, row, file) {
    super(game, board, player, row, file);
  }

  get moves() {
    const directions = [
      [-1, -1],
      [-1, 1],
      [1, -1],
      [1, 1],
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ];
    const available = directions.flatMap((dir) =>
      this.getLegalDirectionalMoves(dir)
    );
    return available;
  }

  onMove(move) {
    super.onMove(move);
  }

  get icon() {
    return this.isWhite() ? "♕" : "♛";
  }

  get img() {
    return this.isWhite() ? "https://www.chess.com/chess-themes/pieces/neo/150/wq.png" : "https://www.chess.com/chess-themes/pieces/neo/150/bq.png"
  }

  get notation() {
    return Queen.notation
  }
}

export default Queen;
