import Piece from "./piece.mjs";

class Rook extends Piece {
  static startingRows = [0, 7];
  static startingFiles = [0, 7];

  name = "Rook";
  notation = "R";

  constructor(game, board, player, row, file) {
    super(game, board, player, row, file);
    this.hasMoved = false;
  }

  get icon() {
    return this.isWhite() ? "♖" : "♜";
  }

  get moves() {
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
;
  }

  onMove(move) {
    super.onMove(move);
    this.hasMoved = true;
  }

  get img() {
    return this.isWhite() ? "https://www.chess.com/chess-themes/pieces/neo/150/wr.png" : "https://www.chess.com/chess-themes/pieces/neo/150/br.png"
  }
}

export default Rook;
