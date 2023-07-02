class BaseMove {
  get isCompoundMove() {
    return false;
  }

  toString() {
    return "I'm a move";
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
    this.isCheck = false;
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
}

export class CompoundMove extends BaseMove {
  constructor(...moves) {
    super();
    this.moves = moves;
  }

  get isCompoundMove() {
    return true;
  }

  get player() {
    return this.moves[0].player;
  }

  get opponent() {
    return this.moves[0].opponent;
  }
}

/**
 * 1. Different classes for different types of moves. Some examples might be Castle, Capture, Simple, Promotion
 * 2. Set flags for different move types
 * 3. create auxilary class for compound moves i.e. castle, promotion
 */