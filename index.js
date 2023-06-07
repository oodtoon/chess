"use strict";

const width = 8;
const squares = [];
let color = "white";

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

  initializePiece(PieceConstructor) {
    for (let row of PieceConstructor.startingRows) {
      const color = row <= 2 ? "white" : "black";
      for (let file of PieceConstructor.startingFiles) {
        const p = new PieceConstructor(this.game, this, color, row, file);
        this.#board[row][file] = p;
      }
    }
    
  }

  initialize() {
    this.initializePiece(Pawn);
    this.initializePiece(Rook);
    this.initializePiece(Bishop);
    this.initializePiece(Queen)
    this.initializePiece(King)
    this.initializePiece(Knight)
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
    let squareContent = this.getSquareContent(row, file);
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

class Piece {
  name = null;

  constructor(game, board, color, row, file) {
    this.color = color;
    this.board = board;
    this.row = row;
    this.file = file;
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
    return this.board.isValidSquare(row, file);
  }

  isSquareOccupied(row, file) {
    return this.board.isSquareOccupied(row, file);
  }

  getLegalDirectionalMoves(directions, magnitude) {
    const vertical = directions[0];
    const horizontal = directions[1];

    const reach = !magnitude ? Board.LANE_SIZE : magnitude + 1;

    const legalMoves = [];

    for (let i = 1; i < reach; i++) {
      const square = [this.row + i * vertical, this.file + i * horizontal];
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
  static startingRows = [1, 6];
  static startingFiles = [0, 1, 3, 4, 5, 6, 7];

  name = "Pawn";

  constructor(game, board, color, row, file) {
    super(game, board, color, row, file);
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
  static startingRows = [0, 7];
  static startingFiles = [0, 7];

  constructor(game, board, color, row, file) {
    super(game, board, color, row, file);
    this.hasMoved = false;
  }

  name = "Rook";

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
  }

  onMove(move) {
    this.hasMoved = true;
  }
}

class Bishop extends Piece {
  static startingRows = [0, 7];
  static startingFiles = [2, 5];

  constructor(game, board, color, row, file) {
    super(game, board, color);
    this.row = row;
    this.file = file;
  }

  name = "Bishop";

  get moves() {
    const directions = [
      [-1, -1],
      [-1, 1],
      [1, -1],
      [1, 1],
    ];
    const available = directions.flatMap((dir) =>
      this.getLegalDirectionalMoves(dir));

    return available;
  }

  onMove(move) {
    console.log(move);
  }
  get icon() {
    return this.isWhite() ? "♗" : "♝";
  }
}

class Knight extends Piece {
  static startingRows = [0, 7];
  static startingFiles = [1, 6];

  constructor(game, board, color, row, file) {
    super(game, board, color);
    this.row = row;
    this.file = file;
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

class Queen extends Piece {
  static startingRows = [0, 7]
  static startingFiles = [3]
  
  constructor(game, board, color, row, file) {
    super(game, board, color);
    this.row = row;
    this.file = file;
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
    console.log(move);
  }

  get icon() {
    return this.isWhite ? "♕" : "♛";
  }
}

class King extends Piece {
  static startingRows = [0, 7]
  static startingFiles = [4]

  constructor(game, board, color, row, file) {
    super(game, board, color);
    this.row = row;
    this.file = file;
    this.hasMoved = false;
    this.isChecked = false;
  }

  name = "King";

  moveOneSquare(row, file, arr, vert, horiz) {
    const nextSquare = [row + vert, file + horiz];
    if (
      this.isValidSquare(...nextSquare) &&
      !this.isSquareOccupied(...nextSquare)
    ) {
      arr.push(Move.fromSquare(nextSquare, this));
      this.isNotChecked();
    } else if (
      this.isValidSquare(...nextSquare) &&
      this.isSquareOccupied(...nextSquare) &&
      this.getSquareContent(...nextSquare).color !== this.color
    ) {
      arr.push(
        Move.fromSquare(nextSquare, this, this.isSquareOccupied(...nextSquare))
      );
    }
    return arr;
  }

  isCheck() {
    this.isChecked = true;
  }

  isNotChecked() {
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

  moveIntoCheck(arr, movingPience) {
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const opponentPiece = this.board.getSquareContent(y, x);
        if (
          opponentPiece !== null &&
          opponentPiece.color !== movingPience.color
        ) {
          for (let i = 0; i < opponentPiece.moves.length; i++) {
            const test = this.board.getSquareContent(
              opponentPiece.moves[i].row,
              opponentPiece.moves[i].file
            );
            if (test !== null && test.name !== "King") {
              arr.push(false);
            } else if (test !== null && test.name === "King") {
              arr.push(true);
              test.isCheck();
            }
          }
        }
      }
    }
    return arr;
  }

  didCheck(piece) {
    for (let i = 0; i < piece.moves.length; i++) {
      const pieceInView = this.board.getSquareContent(
        piece.moves[i].row,
        piece.moves[i].file
      );
      if (
        pieceInView !== null &&
        piece.color !== pieceInView.color &&
        pieceInView.name === "King"
      ) {
        pieceInView.isCheck();
      }
    }
  }

  findKing(movingPience) {
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const king = this.board.getSquareContent(y, x);
        if (
          king !== null &&
          king.color === movingPience.color &&
          king.name === "King"
        ) {
          return king;
        }
      }
    }
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

    const movedPiece = this.board.getSquareContent(
      initiatingPiece.row,
      initiatingPiece.file
    );

    this.didCheck(movedPiece);

    const isKing = [];

    this.moveIntoCheck(isKing, movedPiece);
    if (isKing.indexOf(true) === -1) {
    } else {
      this.findKing(movedPiece).isCheck();
    }
  }
}

document.addEventListener(
  "DOMContentLoaded",
  function () {
    const board = document.querySelector(".board");

    for (let i = 0; i < 64; i++) {
      const square = document.createElement("div");
      square.classList.add("square");
      squares.push(square);
      board.appendChild(square);
    }

    const drawSquares = (color) => {
      for (let i = 63; i >= 0; i--) {
        if (i % width === 0) {
          squares[i].classList.add(color);
        } else {
          if (color === "white") {
            squares[i].classList.add(color);
            color = "black";
          } else if (color === "black") {
            squares[i].classList.add(color);
            color = "white";
          }
        }
      }
    };

    drawSquares(color);
  },
  false
);

//TESTING AREA

const game = new Game();

console.log(game.board);
const whitePawn = game.board.get(1, 0);
console.log(whitePawn.moves);
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
const pawnLeft = game.board.get(1, 1);
const pawnRight = game.board.get(1, 3);
game.doMove(pawnLeft.moves[1]);
game.doMove(pawnRight.moves[1]);
console.log(game.board.debug());

const queen = game.board.get(0, 4);
const rookw = game.board.get(0, 0);
const king = game.board.get(0, 3);
const knight = game.board.get(0, 1);
console.log(rookw);
console.log(wb);
console.log(queen);
console.log(king)
console.log(knight)
