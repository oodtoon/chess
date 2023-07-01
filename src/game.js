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

  doMove(move) {
    this.executeMove(move);
    this.moves.push(move);
  }

  doesMoveExposeCheck(movingPience) {
    const { livePieces } = movingPience.opponent;
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
      this.executeMove(move);
      // console.log({
      //   move,
      //   wasCheck: this.doesMoveExposeCheck(move.initiatingPiece),
      // });
      if (this.doesMoveExposeCheck(move.initiatingPiece)) {
        this.undoMove(move);
        return false;
      } else {
        this.undoMove(move);
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
        console.log("peep", pieceInView);
        pieceInView.setChecked();
      }
    }
  }

  findKing(color) {
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const king = this.board.getSquareContent(y, x);
        if (king !== null && king.color === color && king.name === "King") {
          return king;
        }
      }
    }
  }

  executeMove(move) {
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

  doCastle(move) {
    this.executeCastle(move);
    this.moves.push(move);
  }

  executeCastle(move) {
    const { initiatingPiece: king, capturedPiece: rook } = move;
    

    if (king.file - rook.file === 4) {
      this.board.set(king.row, king.file, null);
      this.board.set(rook.row, rook.file, null);
      this.board.set(king.row, king.file - 3, king);
      this.board.set(rook.row, 3, rook);

      king.onMove(move);
      rook.onMove(move);
    } else {
      this.board.set(king.row, king.file, null);
      this.board.set(rook.row, rook.file, null);
      this.board.set(king.row, king.file + 2, king);
      this.board.set(rook.row, 5, rook);

      king.onMove(move);
      rook.onMove(move);
    }
  }

  undoMove(move) {
    const { row, file, sourceRow, sourceFile, initiatingPiece, capturedPiece } =
      move;
    if (capturedPiece) {
      this.board.set(row, file, capturedPiece);
      capturedPiece.player.removeCapturedPiece(capturedPiece);
      capturedPiece.player.addLivePiece(capturedPiece)
      capturedPiece.player.livePieceMap.King[0].setNotChecked();
    } else {
      this.board.set(row, file, null);
    }
    this.board.set(sourceRow, sourceFile, initiatingPiece);
  }
}
