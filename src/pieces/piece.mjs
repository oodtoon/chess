import Move from "../move.js";
import Board from "../board.js";

class Piece {
  name = null;

  constructor(game, board, player, row, file) {
    this.game = game;
    this.board = board;
    this.player = player;
    this.row = row;
    this.file = file;
  }

  get color() {
    return this.player.color;
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
          }
          break;
        }
      }
    }
    return legalMoves;
  }

  get moves() {
    throw new Error("moves getter is not yet implementeed");
  }

  get opponent() {
    return this.player.opponent;
  }
}

export default Piece;
