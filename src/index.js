"use strict";

import { Piece, Pawn, Rook, Knight, Bishop, Queen, King } from "./pieces/index.mjs";
import Board from "./board.js"

const width = 8;
const squares = [];
let color = "white";

class Game {
  constructor() {
    this.board = new Board(this);
    this.whitePlayer = new Player("white");
    this.blackPlayer = new Player("black");
    this.wireUpOpposition();
    this.board.initialize();
    this.moves = [];
  }

  wireUpOpposition() {
    this.whitePlayer.opponent = this.blackPlayer;
    this.blackPlayer.opponent = this.whitePlayer;
  }

  doMove(move) {
    this.executeMove(move);
    this.moves.push(move);
  }

  doesMoveExposeCheck(movingPience) {
    const { livePieces } = movingPience.opponent;
    for (let opponentPiece of livePieces) {
      for (let move of opponentPiece.moves) {
        if (move.capturedPiece?.name === "King") {
          move.capturedPiece.setChecked();
          return true;
        }
      }
    }
    return false;
  }

  getMoves(piece) {
    return piece.moves.filter((move) => {
      this.executeMove(move);
      console.log({
        move,
        wasCheck: this.doesMoveExposeCheck(move.initiatingPiece),
      });
      if (this.doesMoveExposeCheck(move.initiatingPiece)) {
        this.undoMove(move);
        return false;
      } else {
        this.undoMove(move);
        return true;
      }
    });
  }

  didCheck(piece) {
    for (let move of piece.moves) {
      const pieceInView = this.board.getSquareContent(move.row, move.file);
      if (
        pieceInView !== null &&
        piece.color !== pieceInView.color &&
        pieceInView.name === "King"
      ) {
        pieceInView.setChecked();
      }
    }
  }

  findKing(color) {
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const king = this.board.getSquareContent(y, x);
        if (king !== null && king.color === color && king.name === "King") {
          return king;
        }
      }
    }
  }

  executeMove(move) {
    const { row, file, initiatingPiece, capturedPiece } = move;
    if (capturedPiece) {
      console.log("here");
      const { row: capturedRow, file: capturedFile } = capturedPiece;
      this.board.set(capturedRow, capturedFile, null);
      capturedPiece.player.addCapturedPiece(capturedPiece);
      capturedPiece.player.removeLivePiece(capturedPiece);
    }
    const { row: initiatingRow, file: initiatingFile } = initiatingPiece;
    this.board.set(initiatingRow, initiatingFile, null);
    this.board.set(row, file, initiatingPiece);
    move.initiatingPiece.onMove(move);

    // this.didCheck(initiatingPiece);
  }

  undoMove(move) {
    const { row, file, sourceRow, sourceFile, initiatingPiece, capturedPiece } =
      move;
    if (capturedPiece) {
      this.board.set(row, file, capturedPiece);
    } else {
      this.board.set(row, file, null);
    }
    this.board.set(sourceRow, sourceFile, initiatingPiece);
  }
}

class Player {
  constructor(color) {
    this.color = color;
    /**
     * piece names map to the players' live pieces
     * @type Object<String, Array<Piece>>
     */
    this.livePieceMap = {};
    this.capturedPieces = {};
    this.opponent = null;
  }

  addLivePiece(piece) {
    const pieceType = piece.name;
    if (!(pieceType in this.livePieceMap)) {
      this.livePieceMap[pieceType] = [];
    }
    this.livePieceMap[pieceType].push(piece);
  }

  removeLivePiece(piece) {
    const pieceType = piece.name;
    const indexToRemove = this.livePieceMap[pieceType].findIndex(
      (p) => p === piece
    );

    if (indexToRemove >= 0) {
      this.livePieceMap[pieceType].splice(indexToRemove, 1);
    }
  }

  get livePieces() {
    return Object.values(this.livePieceMap).flat();
  }

  addCapturedPiece(piece) {
    const pieceType = piece.name;
    if (!(pieceType in this.capturedPieces)) {
      this.capturedPieces[pieceType] = [];
    }
    this.capturedPieces[pieceType].push(piece);
  }

  get king() {
    return this.livePieceMap["King"];
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
// console.log(game.getMoves(whitePawn));
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
console.log(game.getMoves(pawnLeft));
game.doMove(game.getMoves(pawnLeft)[0]);
game.doMove(game.getMoves(pawnRight)[1]);
console.log(game.board.debug());

const queen = game.board.get(0, 4);
const rookw = game.board.get(0, 0);
const king = game.board.get(0, 3);
const knight = game.board.get(0, 1);
console.log(rookw);
console.log(wb);
console.log(queen);
console.log(king);
console.log(knight);
