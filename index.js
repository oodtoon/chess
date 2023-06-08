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
    const q = new Queen(this.game, this, "white", 0, 3);
    this.#board[q.row][q.file] = q;
    const qB = new Queen(this.game, this, "black", 7, 3);
    this.#board[qB.row][qB.file] = qB;
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

  getLegalDirectionalMoves(piece, directions) {
    const vertical = directions[0];
    const horizontal = directions[1];

    const legalMoves = [];

    for (let i = 1; i < Board.LANE_SIZE; i++) {
      const square = [piece.row + i * vertical, piece.file + i * horizontal];
      if (this.isValidSquare(...square)) {
        if (!this.isSquareOccupied(...square)) {
          legalMoves.push(Move.fromSquare(square, this));
        } else {
          const otherPiece = this.getSquareContent(...square);
          if (otherPiece.color !== this.color) {
            legalMoves.push(Move.fromSquare(square, this, otherPiece));
          } else {
            break;
          }
        }
      }
    }
    return legalMoves;
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

  get moves() {
    const available = [];

    this.verticalMove(this.row, this.file, available, "up");
    this.verticalMove(this.row, this.file, available, "down");
    this.horizontalMove(this.row, this.file, available, "right");
    this.horizontalMove(this.row, this.file, available, "left");
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

  get moves() {
    const available = [];

    this.moveDiagonally(this.row, this.file, available, "up", "right");
    this.moveDiagonally(this.row, this.file, available, "down", "left");
    this.moveDiagonally(this.row, this.file, available, "up", "left");
    this.moveDiagonally(this.row, this.file, available, "down", "right");
    return available;
  }

  onMove(move) {
    console.log(move);
  }
  get icon() {
    return this.isWhite() ? "♗" : "♝";
  }
}

class Queen extends Piece {
  constructor(game, board, color, row, file) {
    super(game, board, color);
    this.row = row;
    this.file = file;
    this.hasMoved = false;
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
      this.getLegalDirectionalMoves(this, dir)
    );
    return available;
  }

  onMove(move) {
    console.log(move);
  }

  get icon() {
    return this.isWhite ? "♕" : "♛";
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
const whitePawn = game.board.get(1, 0);
console.log(whitePawn.moves);
game.doMove(whitePawn.moves[0]);
const blackPawn = game.board.get(6, 0);
game.doMove(blackPawn.moves[1]);
const whitePawn2 = game.board.get(1, 2);
game.doMove(whitePawn2.moves[0]);
game.doMove(blackPawn.moves[0]);
const whitePawn3 = game.board.get(1, 1);
game.doMove(whitePawn3.moves[1]);
console.log(blackPawn.moves[0]);
game.doMove(blackPawn.moves[0]);
console.log(game.board.debug());
const wb = game.board.get(0, 2);
const queen = game.board.get(0, 3);
const rookw = game.board.get(0, 0);
console.log(rookw);
console.log(wb);
console.log(queen);
