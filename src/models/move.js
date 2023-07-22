import { coordToAlgebraic } from "../util.js";

class BaseMove {
  get isCompoundMove() {
    return false;
  }

  #doesMoveExposeCheck(targetPlayer) {
    const { livePieces } = targetPlayer;
    for (let targetPlayerPiece of livePieces) {
      for (let move of targetPlayerPiece.moves) {
        if (move.capturedPiece?.name === "King") {
          return true;
        }
      }
    }
    return false;
  }

  doesMoveExposePlayerToCheck() {
    return this.#doesMoveExposeCheck(this.opponent);
  }

  doesMoveExposeOpponentToCheck() {
    return this.#doesMoveExposeCheck(this.player);
  }

  checkPawnPromotion() {
    if (this.initiatingPiece.isPawn() && (this.row === 0 || this.row === 7)) {
      return true;
    } else {
      return false;
    }
  }
}

export default class Move extends BaseMove {
  static fromSquare(square, initiatingPiece, capturedPiece = null) {
    return new Move(...square, initiatingPiece, capturedPiece);
  }

  constructor(row, file, initiatingPiece, capturedPiece) {
    super();
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
  get player() {
    return this.initiatingPiece.player;
  }

  get opponent() {
    return this.initiatingPiece.opponent;
  }

  get isCapture() {
    return this.capturedPiece !== null;
  }

  isShortCastle() {
    if (this.initiatingPiece.name !== "King") {
      return;
    }
    if (this.file === 6) {
      return true;
    } else if (this.file === 2) {
      return false;
    }
  }

  toString() {
    const letter = this.initiatingPiece.isPawn()
      ? ""
      : this.initiatingPiece.notation;
    const capture = this.isCapture ? "x" : "";
    //TODO add promotion into notation similar to capture e8=Q
    const promotedPawn = this.checkPawnPromotion() ? letter : "";

    // const promotedPiece = this.game.board.getSquareContent(this.row, this.file).notation
    // console.log(promotedPiece)
    // also add caslte o-o or o-o-o
    //check +
    //checkmate #
    //stalemate no notation but we can make it and it can be :(
    debugger
    const square = coordToAlgebraic([this.row, this.file]);

    if (this.specialMove === "castle") {
      if (this.initiatingPiece.name === "King") {
        const castle = this.isShortCastle() ? "o-o" : "o-o-o";
        return castle;
      } else {
        return;
      }
    }
    return letter + capture + square;
  }

  get isCheck() {
    return this.doesMoveExposeOpponentToCheck();
  }
}

export class CompoundMove extends BaseMove {
  constructor(kingMove, rookMove, isShort) {
    super();
    this.kingMove = kingMove
    this.rookMove = rookMove
    this.isShort = isShort
  }

  toString() {
    if (this.isShort) {
      return "o-o"
    } else {
      return "o-o-o"
    }
  }

  get row() {
    return this.kingMove.row;
  }

  get file() {
    return this.kingMove.file;
  }

  get isCompoundMove() {
    return true;
  }

  get player() {
    return this.kingMove.player;
  }

  get opponent() {
    return this.kingMove.opponent;
  }

  get moves() {
    return [this.kingMove, this.rookMove]
  }
}
