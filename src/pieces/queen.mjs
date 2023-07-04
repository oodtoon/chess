import Piece from "./piece.mjs";

class Queen extends Piece {
  static startingRows = [0, 7];
  static startingFiles = [3];

  constructor(game, board, player, row, file) {
    super(game, board, player, row, file);
  }

  name = "Queen";

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
    console.log(move);
  }

  get icon() {
    return this.isWhite() ? "♕" : "♛";
  }

  get class() {
    return this.isWhite() ? "https://www.chess.com/chess-themes/pieces/neo/150/wq.png" : "https://www.chess.com/chess-themes/pieces/neo/150/bq.png"
  }
}

export default Queen;
