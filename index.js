"use strict";

class Board {
  static LANE_SIZE = 8;
  #board = null;

  constructor(game) {
    this.game = game;
    this.#board = [];
    for (let i = 0; i < Board.LANE_SIZE; i++) {
      const file = new Array(Board.LANE_SIZE).fill(null);
      this.#board[i] = file;
    }
  }

  initialize() {
    for (let i = 0; i < Board.LANE_SIZE; i++) {
      const p = new Pawn(this.game, this, "white", 1, i);
      this.#board[p.row][p.file] = p;
      const pB = new Pawn(this.game, this, "black", 6, i);
      this.#board[pB.row][pB.file] = pB;
    }
    for (let i = 0; i < Board.LANE_SIZE; i += 7) {
      const r = new Rook(this.game, this, "white", 0, i);
      this.#board[r.row][r.file] = r;
      const rB = new Rook(this.game, this, "black", 7, i);
      this.#board[rB.row][rB.file] = rB;
    }
    for (let i = 2; i < 6; i += 3) {
      const b = new Bishop(this.game, this, "white", 0, i);
      this.#board[b.row][b.file] = b;
      const bB = new Bishop(this.game, this, "black", 7, i);
      this.#board[bB.row][bB.file] = bB;
    }
  }

  getSquareContent(row, file) {
    return this.#board[row][file];
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

class Piece {
  name = null;

  constructor(game, board, color) {
    this.color = color;
    this.board = board;
  }

  toString() {
    return `<${this.name}>`;
  }

  isBlack() {
    return this.color === "black";
  }

  isWhite() {
    return this.color === "white";
  }

  getSquareContent(row, file) {
    return this.board.getSquareContent(row, file);
  }

  isValidSquare(row, file) {
    return (
      row >= 0 && row < Board.LANE_SIZE && file >= 0 && file < Board.LANE_SIZE
    );
  }

  isSquareOccupied(row, file) {
    let squareContent = this.getSquareContent(row, file);
    return squareContent !== null;
  }

  get moves() {
    throw new Error("moves getter is not yet implementeed");
  }
}

class Pawn extends Piece {
  name = "Pawn";

  constructor(game, board, color, row, file) {
    super(game, board, color);
    this.row = row;
    this.file = file;
    this.hasMoved = false;
    this.hasDoubleMoved = false;
  }

  canEnPassant(row, file) {
    const squareContent = this.getSquareContent(row, file);
    const lastMove = game.moves.at(-1);
    return (
      this.isValidSquare(row, file) &&
      squareContent &&
      lastMove &&
      lastMove.initiatingPiece === squareContent &&
      lastMove.initiatingPiece.color !== this.color &&
      lastMove.isPawnDoubleMove
    );
  }

  get moves() {
    const available = [];
    const direction = this.isWhite() ? 1 : -1;

    const firstSquare = [this.row + 1 * direction, this.file];
    if (!this.isSquareOccupied(...firstSquare)) {
      available.push(Move.fromSquare(firstSquare, this));
    }

    const secondSquare = [this.row + 2 * direction, this.file];
    if (!this.hasMoved && !this.isSquareOccupied(...secondSquare)) {
      available.push(Move.fromSquare(secondSquare, this));
    }

    const leftDiag = [this.row + 1 * direction, this.file - 1];

    if (this.isValidSquare(...leftDiag) && this.isSquareOccupied(...leftDiag)) {
      available.push(
        Move.fromSquare(leftDiag, this, this.getSquareContent(...leftDiag))
      );
    }

    const rightDiag = [this.row + 1 * direction, this.file + 1];
    if (
      this.isValidSquare(...rightDiag) &&
      this.isSquareOccupied(...rightDiag)
    ) {
      available.push(
        Move.fromSquare(rightDiag, this, this.getSquareContent(...rightDiag))
      );
    }

    const leftSquare = [this.row, this.file - 1];
    const rightSquare = [this.row, this.file + 1];
    if (this.canEnPassant(...leftSquare)) {
      available.push(
        Move.fromSquare(leftDiag, this, this.getSquareContent(...leftSquare))
      );
    }
    if (this.canEnPassant(...rightSquare)) {
      available.push(
        Move.fromSquare(rightDiag, this, this.getSquareContent(...rightSquare))
      );
    }

    return available;
  }

  get icon() {
    return this.isWhite() ? "♙" : "♟";
  }
  onMove(move) {
    this.hasMoved = true;
  }
}

class Rook extends Piece {
  constructor(game, board, color, row, file) {
    super(game, board, color);
    this.row = row;
    this.file = file;
    this.hasMoved = false;
  }

  name = "Rook";

  get icon() {
    return this.isWhite() ? "♖" : "♜";
  }

  rightMove(row, file, arr) {
    for (let i = 1; i < Board.LANE_SIZE; i++) {
      const horizontalRight = [row, file + i];
      if (
        this.isValidSquare(...horizontalRight) &&
        !this.isSquareOccupied(...horizontalRight)
      ) {
        arr.push(Move.fromSquare(horizontalRight, this));
      } else if (
        this.isValidSquare(...horizontalRight) &&
        this.isSquareOccupied(...horizontalRight) &&
        this.getSquareContent(...horizontalRight).color !== this.color
      ) {
        arr.push(
          Move.fromSquare(
            horizontalRight,
            this,
            this.getSquareContent(...horizontalRight)
          )
        );
      }
    }
  }

  leftMove(row, file, arr) {
    for (let i = 1; i < Board.LANE_SIZE; i++) {
      const horizontalLeft = [row, file - i];
      if (
        this.isValidSquare(...horizontalLeft) &&
        !this.isSquareOccupied(...horizontalLeft)
      ) {
        arr.push(Move.fromSquare(horizontalLeft, this));
      } else if (
        this.isValidSquare(...horizontalLeft) &&
        this.isSquareOccupied(...horizontalLeft) &&
        this.getSquareContent(...horizontalLeft).color !== this.color
      ) {
        arr.push(
          Move.fromSquare(
            horizontalLeft,
            this,
            this.getSquareContent(...horizontalLeft)
          )
        );
      }
    }
  }

  get moves() {
    const available = [];

    for (let i = this.row + 1; i < Board.LANE_SIZE; i++) {
      const up = [this.row + i, this.file];

      if (this.isValidSquare(...up) && !this.isSquareOccupied(...up)) {
        available.push(Move.fromSquare(up, this));
      } else if (this.isValidSquare(...up) && this.isSquareOccupied(...up)) {
        if (this.getSquareContent(...up).color !== this.color) {
          available.push(
            Move.fromSquare(up, this, this.getSquareContent(...up))
          );
        }
        this.rightMove(this.row, this.file, available);
        this.leftMove(this.row, this.file, available);
        return available;
      }
    }

    for (let i = 1; i < Board.LANE_SIZE; i++) {
      const down = [this.row - i, this.file];

      if (this.isValidSquare(...down) && !this.isSquareOccupied(...down)) {
        available.push(Move.fromSquare(down, this));
      } else if (
        this.isValidSquare(...down) &&
        this.isSquareOccupied(...down)
      ) {
        if (this.getSquareContent(...down).color !== this.color) {
          available.push(
            Move.fromSquare(down, this, this.getSquareContent(...down))
          );
        }
        this.rightMove(this.row, this.file, available);
        this.leftMove(this.row, this.file, available);
        return available;
      }
    }

    return available;
  }
  onMove(move) {
    this.hasMoved = true;
  }
}

class Bishop extends Piece {
  constructor(game, board, color, row, file) {
    super(game, board, color);
    this.row = row;
    this.file = file;
  }

  name = "Bishop";

  nearestSquareOccupied(square) {
    if (this.isSquareOccupied(...square)) {
      return square;
    }
  }

  moveDiagonally(row, file, arr, vert, horiz) {
    const upDown = vert === "up" ? 1 : -1
    const leftRight = horiz === "right" ? 1 : -1

    for (let i = 1; i < Board.LANE_SIZE; i++) {
      const square = [row + i * upDown, file + i * leftRight]
      if (this.isValidSquare(...square) && !this.isSquareOccupied(...square)) {
        arr.push(Move.fromSquare(square, this));
      } else if (
        this.isValidSquare(...square) &&
        this.isSquareOccupied(...square)
      ) {
        if (this.getSquareContent(...square).color !== this.color) {
          arr.push(
            Move.fromSquare(square, this, this.getSquareContent(...square))
          );
        }
        return arr;
      }
    }
    return arr
  }

  get moves() {
    const available = []

    this.moveDiagonally(this.row, this.file, available, "up", "right");
    this.moveDiagonally(this.row, this.file, available, "down", "left");
    this.moveDiagonally(this.row, this.file, available, "up", "left");
    this.moveDiagonally(this.row, this.file, available, "down", "right");
    return available
  }

  onMove(move) {
    console.log(move);
  }
  get icon() {
    return this.isWhite() ? "♗" : "♝";
  }
}

class Move {
  static fromSquare(square, initiatingPiece, capturedPiece = null) {
    return new Move(...square, initiatingPiece, capturedPiece);
  }

  constructor(row, file, initiatingPiece, capturedPiece) {
    this.row = row;
    this.file = file;
    this.initiatingPiece = initiatingPiece;
    this.sourceRow = initiatingPiece.row;
    this.sourceFile = initiatingPiece.file;
    this.capturedPiece = capturedPiece;
  }

  get isPawnDoubleMove() {
    return (
      this.initiatingPiece.name === "Pawn" &&
      Math.abs(this.sourceRow - this.row) === 2
    );
  }
}

class Game {
  constructor() {
    this.board = new Board(this);
    this.board.initialize();
    this.moves = [];
  }

  doMove(move) {
    this.executeMove(move);
    this.moves.push(move);
  }

  executeMove(move) {
    const { row, file, initiatingPiece, capturedPiece } = move;
    if (capturedPiece) {
      const { row: capturedRow, file: capturedFile } = capturedPiece;
      this.board.set(capturedRow, capturedFile, null);
    }
    const { row: initiatingRow, file: initiatingFile } = initiatingPiece;
    this.board.set(initiatingRow, initiatingFile, null);
    this.board.set(row, file, initiatingPiece);
    move.initiatingPiece.onMove(move);
  }
}

//TESTING AREA

const game = new Game();

console.log(game.board);
// const whitePawn = game.board.get(1, 0);
// console.log(whitePawn.moves);
// game.doMove(whitePawn.moves[0]);
// const blackPawn = game.board.get(6, 0);
// game.doMove(blackPawn.moves[1]);
// const whitePawn2 = game.board.get(1, 2);
// game.doMove(whitePawn2.moves[0]);
// game.doMove(blackPawn.moves[0]);
// const whitePawn3 = game.board.get(1, 1);
// game.doMove(whitePawn3.moves[1]);
// console.log(blackPawn.moves[0]);
// game.doMove(blackPawn.moves[0]);


const wb = game.board.get(0, 2);
console.log(game.board.debug());
console.log(wb);
