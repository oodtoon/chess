import Piece from "./piece.mjs";

class King extends Piece {
  static startingRows = [0, 7];
  static startingFiles = [4];

  constructor(game, board, player, row, file) {
    super(game, board, player, row, file);
    this.hasMoved = false;
    this.isChecked = false;
  }

  name = "King";

  setCheck() {
    this.isChecked = true;
  }

  setNotChecked() {
    this.isChecked = false;
  }

  get moves() {
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
    return available;
  }

  get icon() {
    return this.isWhite() ? "♔" : "♚";
  }

  onMove(move) {
    this.hasMoved = true;
  }
}

export default King;
