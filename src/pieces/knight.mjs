import Piece from "./piece.mjs";

class Knight extends Piece {
  static startingRows = [0, 7];
  static startingFiles = [1, 6];

  constructor(game, board, player, row, file) {
    super(game, board, player, row, file);
  }

  name = "Knight";

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
    console.log(move);
  }

  get icon() {
    return this.isWhite() ? "♘" : "♞";
  }
}

export default Knight;
