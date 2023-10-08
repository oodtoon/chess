import Move, { BaseMove, CompoundMove } from "../move";
import Board from "../board";
import type Game from "../game";
import type Player from "../player";
import type { Square } from "$lib/type";

abstract class Piece {
  static startingRows: number[] = [];
  static startingFiles: number[] = [];
  static notation = "";
  name: string = "";
  value: number  =0
  #moveCache = new WeakMap();
  id = crypto.randomUUID();
  hasMoved = false;

  abstract computeMoves(): (Move | CompoundMove)[];
  abstract get icon(): string;
  abstract get img(): string;
  abstract get notation(): string;

  constructor(
    readonly game: Game,
    readonly board: Board,
    readonly player: Player,
    public row: number,
    public file: number
  ) {}

  get color() {
    return this.player.color;
  }

  toString() {
    return `<${this.name}>`;
  }

  isBlack() {
    return this.color === "Black";
  }

  isWhite() {
    return this.color === "White";
  }

  getSquareContent(row: number, file: number) {
    return this.board.getSquareContent(row, file);
  }

  isValidSquare(row: number, file: number) {
    return this.board.isValidSquare(row, file);
  }

  isSquareOccupied(row: number, file: number) {
    return this.board.isSquareOccupied(row, file);
  }

  getLegalDirectionalMoves(directions: number[], magnitude?: number) {
    const vertical = directions[0];
    const horizontal = directions[1];

    const reach = !magnitude ? Board.LANE_SIZE : magnitude + 1;

    const legalMoves = [];

    for (let i = 1; i < reach; i++) {
      const square: Square = [
        this.row + i * vertical,
        this.file + i * horizontal,
      ];
      if (this.isValidSquare(...square)) {
        if (!this.isSquareOccupied(...square)) {
          legalMoves.push(Move.fromSquare(square, this));
        } else {
          const otherPiece = this.getSquareContent(...square);
          if (otherPiece?.color !== this.color) {
            legalMoves.push(Move.fromSquare(square, this, otherPiece));
          }
          break;
        }
      }
    }
    return legalMoves;
  }

  get moves(): BaseMove[] {
    // FIXME: caching moves has many unintended consequences
    // if (this.#moveCache.has(this.game.moveId)) {
    //   return this.#moveCache.get(this.game.moveId);
    // }
    // const computed = this.computeMoves();
    // this.#moveCache.set(this.game.moveId, computed);
    return this.computeMoves();
  }

  get opponent() {
    return this.player.opponent;
  }

  onMove(move: BaseMove) {
    this.hasMoved = true;
    this.game.eventBus.dispatchEvent("move", {
      move,
    });
  }

  #isPiece(name: string) {
    return this.name === name;
  }

  isPawn() {
    return this.#isPiece("Pawn");
  }

  isRook() {
    return this.#isPiece("Rook");
  }

  isKnight() {
    return this.#isPiece("Knight");
  }

  isBishop() {
    return this.#isPiece("Bishop");
  }

  isQueen() {
    return this.#isPiece("Queen");
  }

  isKing() {
    return this.#isPiece("King");
  }
}

export default Piece;
