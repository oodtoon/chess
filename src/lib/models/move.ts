import { coordToAlgebraic, intToFile } from "../util.js";
import type Piece from "./pieces/piece.js";
import type Player from "./player.js";

class BaseMove {
  #isCheck: null | boolean = null;
  #isCheckmate: null | boolean = null;
  id = Symbol(crypto.randomUUID());
  constructor(readonly player: Player) {}

  get isCompoundMove() {
    return false;
  }

  #doesMoveExposeCheck(targetPlayer: Player) {
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

  get opponent() {
    return this.player.opponent!;
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
  static fromSquare(
    square: [number, number],
    initiatingPiece: Piece,
    capturedPiece: Piece | null = null
  ) {
    return new Move(...square, initiatingPiece, capturedPiece);
  }

  sourceRow: number;
  sourceFile: number;
  pieceToPromoteTo: Piece | null;

  constructor(
    readonly row: number,
    readonly file: number,
    private readonly initiatingPiece: Piece,
    private readonly capturedPiece: Piece | null
  ) {
    super(initiatingPiece.player);

    this.sourceRow = initiatingPiece.row;
    this.sourceFile = initiatingPiece.file;
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

    const square = coordToAlgebraic([this.row, this.file]);
    return letter + capture + square + promotion + check + checkMate;
  }
}

export class CompoundMove extends BaseMove {
  constructor(
    readonly kingMove: Move,
    readonly rookMove: Move,
    private readonly isShort: boolean
  ) {
    super(kingMove.player);
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
