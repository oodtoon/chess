import { coordToAlgebraic, intToFile } from "../util.js";
import type Piece from "./pieces/piece.js";
import type Player from "./player.js";

export abstract class BaseMove {
  #isCheck: null | boolean = null;
  #isCheckmate: null | boolean = null;
  initiatingPiece: Piece | null = null;
  capturedPiece: Piece | null = null;
  pieceToPromoteTo: Piece | null = null;
  sourceRow: number | null = null;
  sourceFile: number | null = null;
  disc: string | null = "";

  abstract get row(): number;
  abstract get file(): number;
  abstract get isCompoundMove(): boolean;

  abstract get isCapture(): boolean;
  abstract get isPawnDoubleMove(): boolean;

  id = Symbol(crypto.randomUUID());
  constructor(readonly player: Player) {}

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

  get isPromotion() {
    if (!this.initiatingPiece || !this.initiatingPiece.isPawn()) {
      return false;
    }

    if (this.player.color === "White") {
      return this.row === 7;
    }
    return this.row === 0;
  }

  toString() {
    const letter = this.initiatingPiece!.isPawn()
      ? this.isCapture
        ? intToFile(this.sourceFile!)
        : ""
      : this.initiatingPiece!.notation;

    const disc = this.disc;

    const capture = this.isCapture ? "x" : "";
    const checkMate = this.isCheckmate ? "#" : "";
    const check = this.isCheck && !this.isCheckmate ? "+" : "";
    const promotion = this.pieceToPromoteTo
      ? "=" + this.pieceToPromoteTo.notation
      : "";

    const square = coordToAlgebraic([this.row, this.file]);
    return letter + disc + capture + square + promotion + check + checkMate;
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

  sourceRow: number | null;
  sourceFile: number | null;
  disc: string | null

  constructor(
    readonly row: number,
    readonly file: number,
    readonly initiatingPiece: Piece | null,
    readonly capturedPiece: Piece | null
  ) {
    super(initiatingPiece!.player);

    this.sourceRow = initiatingPiece!.row;
    this.sourceFile = initiatingPiece!.file;
    this.disc = ""
  }

  get isPawnDoubleMove() {
    return (
      this.initiatingPiece!.name === "Pawn" &&
      Math.abs(this.sourceRow! - this.row) === 2
    );
  }

  get isCapture() {
    return this.capturedPiece !== null;
  }

  get isCompoundMove() {
    return false;
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
      return "O-O";
    } else {
      return "O-O-O";
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

  get moves(): Move[] {
    return [this.kingMove, this.rookMove];
  }

  get isPawnDoubleMove() {
    return false;
  }

  get isCapture() {
    return false;
  }
}
