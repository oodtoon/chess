import { Pawn, Rook, Knight, Bishop, Queen, King } from "./pieces/index.mjs";

export default class Board {
  static LANE_SIZE = 8;
  #board = null;

  constructor(game) {
    this.game = game;
    this.#board = [];

    for (let i = 0; i < Board.LANE_SIZE; i++) {
      const file = new Array(Board.LANE_SIZE).fill(null);
      this.#board[i] = file;
    }

    this.willRotate = true;
  }

  initializePiece(PieceConstructor) {
    for (const row of PieceConstructor.startingRows) {
      const player = row <= 2 ? this.game.whitePlayer : this.game.blackPlayer;
      for (const file of PieceConstructor.startingFiles) {
        const p = new PieceConstructor(this.game, this, player, row, file);
        this.#board[row][file] = p;
        player.addLivePiece(p);
      }
    }
  }

  initialize() {
    this.initializePiece(Pawn);
    this.initializePiece(Rook);
    this.initializePiece(Bishop);
    this.initializePiece(Queen);
    this.initializePiece(King);
    this.initializePiece(Knight);
  }

  getSquareContent(row, file) {
    return this.#board[row][file];
  }

  isValidSquare(row, file) {
    return (
      row >= 0 && row < Board.LANE_SIZE && file >= 0 && file < Board.LANE_SIZE
    );
  }

  isSquareOccupied(row, file) {
    const squareContent = this.getSquareContent(row, file);
    return squareContent !== null;
  }

  set(row, file, value) {
    this.#board[row][file] = value;
    if (value) {
      value.row = row;
      value.file = file;
    }
  }

  get(row, file) {
    return this.#board[row][file];
  }

  debug() {
    return this.#board
      .map((row) =>
        row.map((piece) => (piece === null ? " " : piece.icon)).join("")
      )
      .reverse()
      .join("\n");
  }
}
