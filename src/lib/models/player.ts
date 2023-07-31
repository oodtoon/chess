import type { Color } from "$lib/type";
import type Game from "./game";
import type { Piece } from "./pieces";

type PieceMap = {
  [name: Piece["name"]]: Piece[];
};

export default class Player {
  private _opponent?: Player | null = null;

  livePieceMap: PieceMap = {};
  capturedPieceMap: PieceMap = {};
  showMoves = false;
  selectedPiece = null;
  isCheckMate = false;

  constructor(
    readonly color: Color,
    private readonly game: Game
  ) {}

  addLivePiece(piece: Piece) {
    const pieceType = piece.name;
    if (!(pieceType in this.livePieceMap)) {
      this.livePieceMap[pieceType] = [];
    }
    this.livePieceMap[pieceType].push(piece);
  }

  removeLivePiece(piece: Piece) {
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

  get capturedPieces() {
    return Object.values(this.capturedPieceMap).flat();
  }

  addCapturedPiece(piece: Piece) {
    const pieceType = piece.name;
    if (!(pieceType in this.capturedPieceMap)) {
      this.capturedPieceMap[pieceType] = [];
    }
    this.capturedPieceMap[pieceType].push(piece);
  }

  removeCapturedPiece(piece: Piece) {
    const pieceType = piece.name;
    const indexToRemove = this.capturedPieceMap[pieceType].findIndex(
      (p: Piece) => p === piece
    );

    if (indexToRemove >= 0) {
      this.capturedPieceMap[pieceType].splice(indexToRemove, 1);
    }
  }

  get king() {
    return this.livePieceMap.King;
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
}
