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

  initialize() {
    // for (let i = 0; i < Board.LANE_SIZE; i++) {
    //   const p = new Pawn(this.game, this, "white", 1, i);
    //   this.#board[p.row][p.file] = p;
    //   const pB = new Pawn(this.game, this, "black", 6, i);
    //   this.#board[pB.row][pB.file] = pB;
    // }
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

    for (let i = 1; i < 7; i += 5) {
      const kn = new Knight(this.game, this, "white", 0, i);
      this.#board[kn.row][kn.file] = kn;
      const knB = new Knight(this.game, this, "black", 7, i);
      this.#board[knB.row][knB.file] = knB;
    }

    const q = new Queen(this.game, this, "white", 0, 3);
    this.#board[q.row][q.file] = q;
    const qB = new Queen(this.game, this, "black", 7, 3);
    this.#board[qB.row][qB.file] = qB;

    const k = new King(this.game, this, "white", 0, 4);
    this.#board[k.row][k.file] = k;
    const kB = new King(this.game, this, "black", 7, 4);
    this.#board[kB.row][kB.file] = kB;
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

  isKing(row, file) {
    return this.getSquareContent(row, file).name === "King";
  }

  horizontalMove(row, file, arr, direction) {
    const horizontal = direction === "right" ? 1 : -1;

    for (let i = 1; i < Board.LANE_SIZE; i++) {
      const horizDirection = [row, file + i * horizontal];
      if (
        this.isValidSquare(...horizDirection) &&
        !this.isSquareOccupied(...horizDirection)
      ) {
        arr.push(Move.fromSquare(horizDirection, this));
      } else if (
        this.isValidSquare(...horizDirection) &&
        this.isSquareOccupied(...horizDirection)
      ) {
        if (this.getSquareContent(...horizDirection).color !== this.color) {
          arr.push(
            Move.fromSquare(
              horizDirection,
              this,
              this.getSquareContent(...horizDirection)
            )
          );
        }
        return arr;
      }
    }
  }

  verticalMove(row, file, arr, direction) {
    const vertical = direction === "up" ? 1 : -1;

    for (let i = 1; i < Board.LANE_SIZE; i++) {
      const vertDirection = [row + i * vertical, file];

      if (
        this.isValidSquare(...vertDirection) &&
        !this.isSquareOccupied(...vertDirection)
      ) {
        arr.push(Move.fromSquare(vertDirection, this));
      } else if (
        this.isValidSquare(...vertDirection) &&
        this.isSquareOccupied(...vertDirection)
      ) {
        if (this.getSquareContent(...vertDirection).color !== this.color) {
          arr.push(
            Move.fromSquare(
              vertDirection,
              this,
              this.getSquareContent(...vertDirection)
            )
          );
        }
        return arr;
      }
    }
  }

  moveDiagonally(row, file, arr, vert, horiz) {
    const upDown = vert === "up" ? 1 : -1;
    const leftRight = horiz === "right" ? 1 : -1;

    for (let i = 1; i < Board.LANE_SIZE; i++) {
      const square = [row + i * upDown, file + i * leftRight];
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
    return arr;
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

class Knight extends Piece {
  constructor(game, board, color, row, file) {
    super(game, board, color);
    this.row = row;
    this.file = file;
  }

  name = "Knight";

  elMove(row, file, arr, vert, horiz) {
    const elSquare = [row + vert, file + horiz];

    if (this.isValidSquare(...elSquare)) {
      if (!this.isSquareOccupied(...elSquare)) {
        arr.push(Move.fromSquare(elSquare, this));
      } else if (
        this.isSquareOccupied(...elSquare) &&
        this.getSquareContent(...elSquare).color !== this.color
      ) {
        arr.push(
          Move.fromSquare(elSquare, this, this.getSquareContent(...elSquare))
        );
      }
    }
    return arr;
  }

  get moves() {
    const available = [];

    this.elMove(this.row, this.file, available, 2, 1);
    this.elMove(this.row, this.file, available, 1, 2);

    this.elMove(this.row, this.file, available, -2, 1);
    this.elMove(this.row, this.file, available, -1, 2);

    this.elMove(this.row, this.file, available, -2, -1);
    this.elMove(this.row, this.file, available, -1, -2);

    this.elMove(this.row, this.file, available, 2, -1);
    this.elMove(this.row, this.file, available, 1, -2);

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
  constructor(game, board, color, row, file) {
    super(game, board, color);
    this.row = row;
    this.file = file;
  }

  name = "Queen";

  get moves() {
    const available = [];
    this.verticalMove(this.row, this.file, available, "up");
    this.verticalMove(this.row, this.file, available, "down");
    this.horizontalMove(this.row, this.file, available, "right");
    this.horizontalMove(this.row, this.file, available, "left");

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
    return this.isWhite ? "♕" : "♛";
  }
}

class King extends Piece {
  constructor(game, board, color, row, file, castleType) {
    super(game, board, color);
    this.row = row;
    this.file = file;
    this.hasMoved = false;
    this.isChecked = false;
    this.castleType = castleType
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
        Move.fromSquare(nextSquare, this, this.getSquareContent(...nextSquare))
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

  castleMove(row, file, arr, type) {
    const emptySquare = [];
    const currentSquare = [row, file];

    const direction = type === "short" ? 1 : -1;

    for (let i = 0; i < file; i++) {
      const nextSquare = [row, file + i * direction];
      if (!this.isSquareOccupied(...nextSquare)) {
        emptySquare.push(true);
      }
    }

    if (
      emptySquare.length === 3 &&
      this.getSquareContent(row, 0).name === "Rook" &&
      this.getSquareContent(row, 0).hasMoved === false &&
      this.getSquareContent(row, file).hasMoved === false
    ) {
      arr.push(
        Move.fromSquare(currentSquare, this, this.getSquareContent(row, 0))
      );
    } else if (
      emptySquare.length === 2 &&
      this.getSquareContent(row, 7).name === "Rook" &&
      this.getSquareContent(row, 0).hasMoved === false &&
      this.getSquareContent(row, file).hasMoved === false
    ) {
      arr.push(
        Move.fromSquare(currentSquare, this, this.getSquareContent(row, 7))
      );
    }
    return arr;
  }

  get moves() {
    const available = [];

    this.moveOneSquare(this.row, this.file, available, 1, 0);
    this.moveOneSquare(this.row, this.file, available, -1, 0);

    this.moveOneSquare(this.row, this.file, available, 0, 1);
    this.moveOneSquare(this.row, this.file, available, 0, -1);

    this.moveOneSquare(this.row, this.file, available, 1, 1);
    this.moveOneSquare(this.row, this.file, available, 1, -1);

    this.moveOneSquare(this.row, this.file, available, -1, 1);
    this.moveOneSquare(this.row, this.file, available, -1, -1);

    this.castleMove(this.row, this.file, available, "long");
    this.castleMove(this.row, this.file, available, "short");

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

  doCastle(move) {
    this.executeCastle(move);
    this.moves.push(move);
  }

  executeCastle(move) {
    const { initiatingPiece: king, capturedPiece: rook } = move;

    if (king.file - rook.file === 4) {
      this.board.set(king.row, king.file, null);
      this.board.set(rook.row, rook.file, null);
      this.board.set(king.row, king.file - 3, king);
      this.board.set(rook.row, rook.file + 3, rook);

      king.onMove(move);
      rook.onMove(move)
    } else {
      this.board.set(king.row, king.file, null);
      this.board.set(rook.row, rook.file, null);
      this.board.set(king.row, king.file + 2, king);
      this.board.set(rook.row, rook.file - 2, rook);

      king.onMove(move);
      rook.onMove(move)
    }
    


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

//King gets checked on move only

// const queen = game.board.get(7, 4);
// const king = game.board.get(0, 3);
// const wk = game.board.get(0, 1);
// game.doMove(queen.moves[7]);
// game.doMove(wk.moves[1]);
// game.doMove(wk.moves[1]);
// game.doMove(king.moves[0]);
// console.log(game.board.debug());
// console.log(king);

const wb = game.board.get(0, 2);
const queen = game.board.get(0, 3);
const king = game.board.get(0, 4);
const whiteKnight = game.board.get(0, 1);
const rook = game.board.get(0, 0);
const secondR = game.board.get(0, 7);
const rightB = game.board.get(0, 5);
const rightK = game.board.get(0, 6);
game.doMove(wb.moves[4]);
game.doMove(queen.moves[6]);
game.doMove(whiteKnight.moves[0]);
game.doMove(rightB.moves[0]);
game.doMove(rightK.moves[1]);

game.doCastle(king.moves[6])


console.log(king);

console.log(game.board.debug())
