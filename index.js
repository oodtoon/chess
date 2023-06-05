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
      const pB = new Pawn("Black", 6, i)
      this.#board[pB.row][pB.file] = pB
      console.log(pB)
    }
    console.log(this.#board)
  }
  getSquareContent(row, file) {
    return this.#board[row][file];
  }
}

class Piece {
  name = null;
  toString() {
    return `<${this.name}>`;
  }
  constructor(color) {
    this.color = color;
  }
  get moves() {
    throw new Error("moves getter is not yet implementeed");
  }
}

class Pawn extends Piece {
  name = "Pawn";
  constructor(color, row, file) {
    super(color);
    this.row = row;
    this.file = file;
    this.hasMoved = false;
  }
  get moves() {
    const available = [];
    available.push([this.row + 1, this.file]);
    console.log("small change")
    return available;
  }
}

//TESTING AREA

const b = new Board();

b.initialize();

const p = new Pawn("white", 1, 0);

console.log(Board.LANE_SIZE);

console.log(`${p}`, p);

console.log(p.moves);
