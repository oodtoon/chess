import Piece from "./piece.mjs";

class Knight extends Piece {
  static startingRows = [0, 7];
  static startingFiles = [1, 6];

  name = "Knight";
  notation = "N";

  constructor(game, board, player, row, file) {
    super(game, board, player, row, file);
  }

  get moves() {
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

  onMove(move) {
    super.onMove(move);
    console.log(move);
  }

  get icon() {
    return this.isWhite() ? "♘" : "♞";
  }

  get img() {
    return this.isWhite() ? "https://www.chess.com/chess-themes/pieces/neo/150/wn.png" : "https://www.chess.com/chess-themes/pieces/neo/150/bn.png"
  }
}

export default Knight;
