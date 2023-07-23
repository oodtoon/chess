import { coordToAlgebraic, intToFile } from "../util.js";

class BaseMove {
  #isCheck = null;
  #isCheckmate = null;
  constructor(player) {
    // used to cache move computations
    this.id = Symbol(crypto.randomUUID());
    this.player = player;
  }

  get isCompoundMove() {
    return false;
  }

  #doesMoveExposeCheck(targetPlayer) {
    const { livePieces } = targetPlayer;
    for (const targetPlayerPiece of livePieces) {
      for (const move of targetPlayerPiece.moves) {
        if (move.capturedPiece?.name === "King") {
          return true;
        }
      }
    }
    return false;
  }

  doesMoveExposeCheckmate() {
    if (this.isCheck && this.opponent.moves.length === 0) {
      return true;
    } else {
      return false;
    }
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

  get opponent() {
    return this.player.opponent;
  }

  get isCheck() {
    this.#isCheck = this.#isCheck ?? this.doesMoveExposeOpponentToCheck();
    return this.#isCheck;
  }

  get isCheckmate() {
    this.#isCheckmate = this.#isCheckmate ?? this.doesMoveExposeCheckmate();
    return this.#isCheckmate;
  }
}

export default class Move extends BaseMove {
  static fromSquare(square, initiatingPiece, capturedPiece = null) {
    return new Move(...square, initiatingPiece, capturedPiece);
  }

  constructor(row, file, initiatingPiece, capturedPiece) {
    super(initiatingPiece.player);
    this.row = row;
    this.file = file;
    this.initiatingPiece = initiatingPiece;
    this.sourceRow = initiatingPiece.row;
    this.sourceFile = initiatingPiece.file;
    this.capturedPiece = capturedPiece;
    this.pieceToPromoteTo = null;
  }

  get isPawnDoubleMove() {
    return (
      this.initiatingPiece.name === "Pawn" &&
      Math.abs(this.sourceRow - this.row) === 2
    );
  }

  get isCapture() {
    return this.capturedPiece !== null;
  }

  toString() {
    const letter = this.initiatingPiece.isPawn()
      ? this.isCapture
        ? intToFile(this.sourceFile)
        : ""
      : this.initiatingPiece.notation;

    const capture = this.isCapture ? "x" : "";
    const checkMate = this.isCheckmate ? "#" : "";
    const check = this.isCheck && !this.isCheckmate ? "+" : "";
    const promotion = this.pieceToPromoteTo
      ? "=" + this.pieceToPromoteTo.notation
      : "";

    // stalemate no notation but we can make it and it can be :(
    const square = coordToAlgebraic([this.row, this.file]);
    return letter + capture + square + promotion + check + checkMate;
  }
}

export class CompoundMove extends BaseMove {
  constructor(kingMove, rookMove, isShort) {
    super(kingMove.player);
    this.kingMove = kingMove;
    this.rookMove = rookMove;
    this.isShort = isShort;
  }

  toString() {
    if (this.isShort) {
      return "o-o";
    } else {
      return "o-o-o";
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

  get opponent() {
    return this.kingMove.opponent;
  }

  get moves() {
    return [this.kingMove, this.rookMove];
  }
}
