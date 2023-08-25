import type Color from "../type";
import type Game from "./game";
import { Piece } from "./pieces";
import { Schema, type, MapSchema, ArraySchema } from "@colyseus/schema";

type PieceMap = {
  [name: Piece["name"]]: Piece[];
};

class PieceArray extends Schema {
  @type([Piece])
  pieces = new ArraySchema<Piece>();
}

export default class Player extends Schema {
  private _opponent?: Player | null = null;

  //livePieceMap: PieceMap = {};
  @type({ map: PieceArray })
  livePieceMap = new MapSchema<PieceArray>();
  //capturedPieceMap: PieceMap = {};
  @type({ map: PieceArray }) capturedPieceMap = new MapSchema<ArraySchema<Piece>>();

  @type("boolean") showMoves = false;
  selectedPiece: Piece | null = null;
  @type("boolean") isCheckMate = false;

  constructor(
    readonly color: Color,
    private readonly game: Game
  ) {
    super();
  }

  addLivePiece(piece: Piece) {
    const pieceType = piece.name;
    let livePieces = this.livePieceMap.get(pieceType)
    if (!(livePieces)) {
      livePieces = new PieceArray()
      this.livePieceMap.set(pieceType, livePieces);
    }
    livePieces.pieces.push(piece);
  }

  removeLivePiece(piece: Piece) {
    const pieceType = piece.name;
    const pieceClass = this.livePieceMap.get(pieceType);
    const indexToRemove = pieceClass.pieces.findIndex((p) => p === piece);

    if (indexToRemove >= 0) {
      pieceClass.pieces.splice(indexToRemove, 1);
    }
  }

  get livePieces() {
    return Object.values(this.livePieceMap).flat();
  }

  get capturedPieces() {
    return Object.values(this.capturedPieceMap).flat();
  }

  addCapturedPiece(piece: Piece) {
    const pieceType = piece.name;
    let capturedPieces = this.livePieceMap.get(pieceType)
    if (!(capturedPieces)) {
      capturedPieces = new PieceArray()
      this.livePieceMap.set(pieceType, capturedPieces);
    }
    capturedPieces.pieces.push(piece);
  }

  removeCapturedPiece(piece: Piece) {
    const pieceType = piece.name;
    let capturedPieces = this.livePieceMap.get(pieceType)
    const indexToRemove = capturedPieces.pieces.findIndex((p) => p === piece);

    if (indexToRemove >= 0) {
      capturedPieces.pieces.splice(indexToRemove, 1);
    }
  }

  get king() {
    const king = this.livePieceMap.get("King");
    return king.pieces[0];
  }

  get moves() {
    return this.livePieces.flatMap((piece) => {
      return this.game.getMoves(piece);
    });
  }

  get opponent() {
    return this._opponent!;
  }

  set opponent(player: Player) {
    this._opponent = player;
  }

  get isWhite() {
    return this.color === "White";
  }

  get isBlack() {
    return this.color === "Black";
  }
}
