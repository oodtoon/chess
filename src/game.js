import Board from "./board.js";
import Player from "./player.js";

export default class Game {
  constructor() {
    this.board = new Board(this);
    this.whitePlayer = new Player("white");
    this.blackPlayer = new Player("black");
    this.wireUpOpposition();
    this.board.initialize();
    this.moves = [];
  }

  wireUpOpposition() {
    this.whitePlayer.opponent = this.blackPlayer;
    this.blackPlayer.opponent = this.whitePlayer;
  }

  doesMoveExposeCheck(move) {
    const { livePieces } = move.opponent;
    for (let opponentPiece of livePieces) {
      for (let move of opponentPiece.moves) {
        if (move.capturedPiece?.name === "King") {
          move.capturedPiece.setChecked();
          return true;
        }
      }
    }
    return false;
  }

  getMoves(piece) {
    return piece.moves.filter((move) => {
      this.stageMove(move);
      if (this.doesMoveExposeCheck(move)) {
        this.unstageMove(move);
        return false;
      } else {
        this.unstageMove(move);
        return true;
      }
    });
  }

  didCheck(piece) {
    for (let move of piece.moves) {
      const pieceInView = this.board.getSquareContent(move.row, move.file);
      if (
        pieceInView !== null &&
        piece.color !== pieceInView.color &&
        pieceInView.name === "King"
      ) {
        pieceInView.setChecked();
      }
    }
  }

  stageMove(move) {
   
    if (move.isCompoundMove) {
      move.moves.forEach((move) => this.stageMove(move));
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
      move.initiatingPiece.onMove(move);

      this.didCheck(initiatingPiece);
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
        capturedPiece.player.livePieceMap.King[0].setNotChecked();
      } else {
        this.board.set(row, file, null);
      }
      this.board.set(sourceRow, sourceFile, initiatingPiece);
    }
  }

  getActivePlayer() {
    return this.moves.length % 2 === 0 ? this.whitePlayer : this.blackPlayer 
  }
  doMove(move) {
    this.stageMove(move)
    this.moves.push(move)
  }

  undoMove() {
    this.unstageMove(this.moves.at(-1))
    this.moves.pop()
  }
}
