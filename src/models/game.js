import Board from "./board.js";
import Player from "./player.js";

export default class Game {
  constructor(eventBus) {
    this.board = new Board(this);
    this.eventBus = eventBus
    this.whitePlayer = new Player("White", this);
    this.blackPlayer = new Player("Black", this);
    this.wireUpOpposition();
    this.board.initialize();
    this.moves = [];
    this.result = null
  }

  wireUpOpposition() {
    this.whitePlayer.opponent = this.blackPlayer;
    this.blackPlayer.opponent = this.whitePlayer;
  }

  getMoves(piece) {
    const moves = piece.moves;
    return moves.filter((move) => {
      this.stageMove(move, false);
      if (move.doesMoveExposePlayerToCheck()) {
        this.unstageMove(move);
        return false;
      } else {
        this.unstageMove(move);
        return true;
      }
    });
  }

  stageMove(move, shouldCommitMove = true) {
    if (move.isCompoundMove) {
      move.moves.forEach((move) => this.stageMove(move, shouldCommitMove));
    } else {
      const { row, file, initiatingPiece, capturedPiece } = move;
      if (capturedPiece) {
        const { row: capturedRow, file: capturedFile } = capturedPiece;
        this.board.set(capturedRow, capturedFile, null);
        capturedPiece.player.addCapturedPiece(capturedPiece);
        capturedPiece.player.removeLivePiece(capturedPiece);
      }
      const { row: initiatingRow, file: initiatingFile } = initiatingPiece;
      this.board.set(initiatingRow, initiatingFile, null);
      this.board.set(row, file, initiatingPiece);
      if (shouldCommitMove) {
        move.initiatingPiece.onMove(move);
      }
    }
  }



  unstageMove(move) {
    if (move.isCompoundMove) {
      move.moves.forEach((move) => this.unstageMove(move));
    } else {
      const {
        row,
        file,
        sourceRow,
        sourceFile,
        initiatingPiece,
        capturedPiece,
      } = move;
      if (capturedPiece) {
        this.board.set(row, file, capturedPiece);
        capturedPiece.player.removeCapturedPiece(capturedPiece);
        capturedPiece.player.addLivePiece(capturedPiece);
      } else {
        this.board.set(row, file, null);
      }
      this.board.set(sourceRow, sourceFile, initiatingPiece);
    }
  }

  getActivePlayer() {
    if (this.board.willRotate) {
      return this.moves.length % 2 === 0 ? this.whitePlayer : this.blackPlayer;
    } else {
      return this.moves.length % 2 === 0 ? this.blackPlayer : this.whitePlayer;
    }
    
  }

  doMove(move) {
    if (move.initiatingPiece.name === "Pawn" && (move.row === 7 || move.row === 0)) {
      this.board.willRotate = false
    }

    this.stageMove(move);
    this.moves.push(move);
  }

  undoMove() {
    this.unstageMove(this.moves.at(-1));
    this.moves.pop();
  }

  get lastMove() {
    return this.moves.at(-1);
  }

  isPlayerInCheck() {
    return this.lastMove.isCheck;
  }

  get isGameOver() {
    return this.result !== null
  }
}
