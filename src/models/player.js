export default class Player {
  constructor(color) {
    this.color = color;
    /**
     * piece names map to the players' live pieces
     * @type Object<String, Array<Piece>>
     */
    this.livePieceMap = {};
    this.capturedPieceMap = {};
    this.opponent = null;
    this.showMoves = false
    this.selectedPiece = null
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

  get capturedPieces() {
    return Object.values(this.capturedPieceMap).flat();
  }

  addCapturedPiece(piece) {
    const pieceType = piece.name;
    if (!(pieceType in this.capturedPieceMap)) {
      this.capturedPieceMap[pieceType] = [];
    }
    this.capturedPieceMap[pieceType].push(piece);
  }

  removeCapturedPiece(piece) {
    const pieceType = piece.name;
    const indexToRemove = this.capturedPieceMap[pieceType].findIndex(
      (p) => p === piece
    );

    if (indexToRemove >= 0) {
      this.capturedPieceMap[pieceType].splice(indexToRemove, 1);
    }
  }

  get king() {
    return this.livePieceMap["King"];
  }
}
