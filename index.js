"use strict";

class Board {
  static LANE_SIZE = 8;
  #board = null;

  constructor() {
    this.#board = [];
    for (let i = 0; i < Board.LANE_SIZE; i++) {
      const file = new Array(Board.LANE_SIZE).fill(null);
      this.#board[i] = file;
    }
    console.log(this.#board);
  }

  initialize() {
    console.log(JSON.stringify(this.#board, null, 2));
    for (let i = 0; i < Board.LANE_SIZE; i++) {
      const p = new Pawn("white", 1, i);
      this.#board[p.row][p.file] = p;
      const pB = new Pawn("Black", 6, i);
      this.#board[pB.row][pB.file] = pB;
      console.log(pB);
    }
    console.log(this.#board);
  }
  getSquareContent(row, file) {
    return this.#board[row][file];
  }
}

class Piece {
  name = null;

  constructor(board, color) {
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

  get moves() {
    throw new Error("moves getter is not yet implementeed");
  }
}

class Pawn extends Piece {
  name = "Pawn";

  constructor(board, color, row, file) {
    super(board, color);
    this.row = row;
    this.file = file;
    this.hasMoved = false;
  }

  isSquareOccupied(row, file) {
    let targetMove = [row, file];
    let squareContent = this.board.getSquareContent(...targetMove);
    return squareContent !== null;
  }

  get moves() {
    const available = [];
    const direction = this.isWhite() ? 1 : -1;
    const firstSquare = [this.row + 1 * direction, this.file];
    if (!this.isSquareOccupied(...firstSquare)) {
      available.push(firstSquare);
    }
    const secondSquare = [this.row + 2 * direction, this.file];
    if (!this.hasMoved && !this.isSquareOccupied(...secondSquare)) {
      available.push(secondSquare);
    }

    return available;
  }
}

//TESTING AREA

const b = new Board();

b.initialize();

const p = new Pawn(b, "white", 1, 0);

console.log(Board.LANE_SIZE);

console.log(`${p}`, p);

console.log(p.moves);
