import EventBus from "../event-bus.js";
import Game from "../models/game.js";
import { copyPgn, declareDraw, declareWinner, exportToPgn, handleUndoMove, offerDraw, handleUndoRequest } from "../io.js";

const whitePieces = document.getElementById("white-pieces");
const blackPieces = document.getElementById("black-pieces");

function getPlayerCapturePool(player) {
  return player.color === "white" ? whitePieces : blackPieces;
}

export default class ChessGameController {
  eventBus = new EventBus();

  constructor(selector) {
    this.board = document.querySelector("chess-board" + selector);
    this.game = window.game = new Game(this.eventBus);
    this.turn = document.getElementById("turn");

    this.gameButtons = document.querySelector("game-buttons");
    this.movesList = document.querySelector("moves-list");

    this.drawModal = document.querySelector("draw-modal")
    this.endGameModal = document.querySelector("end-game-modal");

    this.undoModal = document.querySelector("undo-modal")
    this.undoReviewModal = document.querySelector("undo-review-modal")
  }

  initialize() {
    this.mountPieces();
    this.eventBus.addEventListener(
      "piece-capture",
      this.handlePieceCapture.bind(this)
    );

    this.eventBus.addEventListener("piece-move", this.handleMove.bind(this));

    this.eventBus.addEventListener("piece-move", (event) => {
      if (this.movesList.currentListItem.children.length === 2) {
        this.movesList.nextListItem();
      }
      this.movesList.addMove(event.detail.notation);
    });

    this.eventBus.addEventListener("piece-move", (event) => {
      const chessPieceElement = this.board.chessPieces.find(
        (element) => element.piece.id === event.detail.pieceId
      );
      chessPieceElement.remove();
      const destination = this.board.getSquare(...event.detail.to);
      destination.appendChild(chessPieceElement);
    });

    this.movesList.exportButton.addEventListener("click", () => {
      console.log(this.movesList);
      exportToPgn(this.game);
    });

    this.movesList.copyButton.addEventListener("click", () => {
      copyPgn(this.game);
    });

    this.movesList.importButton.addEventListener("click", () => {
      console.log("import");
    });

    this.gameButtons.drawButton.addEventListener("click", () => {
      const activePlayer = this.game.getActivePlayer();
      const color = activePlayer.color;
      const opponentColor = activePlayer.opponent.color;
    
      const drawMsg = `${color} wishes to draw. ${opponentColor}, do you accept?`
    
      offerDraw(this.drawModal, drawMsg)
    });

    this.drawModal.acceptButton.addEventListener("click", () => {
        this.game.result = "1/2-1/2";
        this.turn.textContent = "Draw";
        this.drawModal.hidden = true
        declareDraw(this.game, this.endGameModal)
    })

    this.drawModal.declineButton.addEventListener("click", () => {
      this.drawModal.hidden = true
    })

    this.gameButtons.resignButton.addEventListener("click", () => {
      const activePlayer = this.game.getActivePlayer();
      const color = activePlayer.color;
      const opponentColor = activePlayer.opponent.color;
      const resignMsg = `${color} resigns. ${opponentColor} wins!`
      declareWinner(color, this.game, this.turn, this.endGameModal, resignMsg);
    });

    this.gameButtons.undoButton.addEventListener("click", () => {
      handleUndoMove(this.undoModal)
    })

    this.undoModal.requestButton.addEventListener("click", () => {
      const activePlayer = this.game.getActivePlayer();
      const color = activePlayer.color;
      this.undoModal.hidden = true;
      handleUndoRequest(color, this.undoModal, this.undoReviewModal)
    })

    this.undoModal.cancelButton.addEventListener("click", () => {
      this.undoModal.hidden = true;
    })

    this.undoReviewModal.acceptButton.addEventListener("click", () => {
      console.log("accept")
      this.undoReviewModal.hidden = true;
      this.undoModal.textarea.value = null
    })

    this.undoReviewModal.declineButton.addEventListener("click", () => {
      this.undoReviewModal.hidden = true;
      this.undoModal.textarea.value = null
    })

    this.endGameModal.playAgainButton.addEventListener("click", () => {
      console.log("play again");
    });

    this.endGameModal.exportButton.addEventListener("click", () => {
      exportToPgn(this.game);
    });

    this.endGameModal.copyButton.addEventListener("click", () => {
      copyPgn(this.game);
    });
  }

  handleMove() {
    if (this.game.getActivePlayer() !== this.game.whitePlayer) {
      this.board.setAttribute("rotate", "false");
    } else {
      this.board.setAttribute("rotate", "true");
    }

    const activePlayer = this.game.getActivePlayer();

    const color = activePlayer.color;
    if (activePlayer.opponent.moves.length === 0) {
      setTimeout(() => {
        if (this.game.isPlayerInCheck()) {
          const checkmate = `Checkmate! ${color} player wins!`;
          declareWinner(color, this.game, this.turn, this.endGameModal, checkmate);
        } else {
          const stalemate = "Stalemate"
          declareDraw(this.game, this.endGameModal, stalemate)
        }
      }, 500);
    }

    this.turn.textContent = `${activePlayer.opponent.color}'s Turn`;
  }

  handlePieceCapture(event) {
    const capturedPiece = this.board.chessPieces.find(
      (piece) => piece.piece.id === event.detail.pieceId
    );
    capturedPiece.remove();
    const capturedPieceBin = getPlayerCapturePool(capturedPiece.piece.player);
    capturedPieceBin.appendChild(capturedPiece);
  }

  testScenario() {
    const game = this.game;
    const whiteKing = game.board.get(0, 4);
    const blackKing = game.board.get(7, 4);
    const blackQueen = game.board.get(7, 3);
    const WP5 = game.board.get(1, 5);
    const WP4 = game.board.get(1, 4);
    const WP6 = game.board.get(1, 6);
    const BPL = game.board.get(6, 3);
    const BP1 = game.board.get(6, 1);
    const BP2 = game.board.get(6, 2);
    const WK = game.board.get(0, 6);
    const BK = game.board.get(7, 1);
    const WB = game.board.get(0, 5);
    const BB = game.board.get(7, 2);
    const BP5 = game.board.get(6, 5);

    game.doMove(game.getMoves(WP4)[0]);
    game.doMove(game.getMoves(BPL)[0]);
    game.doMove(game.getMoves(WB)[4]);
    game.doMove(game.getMoves(BB)[4]);
    game.doMove(game.getMoves(WP4)[0]);
    game.doMove(game.getMoves(BPL)[0]);
    game.doMove(game.getMoves(WP4)[1]);
    game.doMove(game.getMoves(BP5)[1]);
  }

  mountPieces() {
    this.mountPlayerPieces(this.game.whitePlayer);
    this.mountPlayerPieces(this.game.blackPlayer);
  }

  mountPlayerPieces(player) {
    for (let piece of player.livePieces) {
      const squareElement = this.board.getSquare(piece.row, piece.file);
      const chessPieceElement = document.createElement("chess-piece");
      chessPieceElement.piece = piece;

      chessPieceElement.addEventListener(
        "click",
        this.handlePieceClick.bind(this)
      );
      squareElement.appendChild(chessPieceElement);
    }
  }

  placeGhostMoves(pieceElement) {
    pieceElement.classList.add("active");

    for (let move of this.game.getMoves(pieceElement.piece)) {
      console.log(move.row, move.file);
      const square = this.board.getSquare(move.row, move.file);

      if (!square) {
        return;
      }

      const ghostMove = document.createElement("ghost-move");
      ghostMove.addEventListener("click", () => {
        this.game.doMove(move);
        this.removeGhostMoves();
      });

      ghostMove.potentialMove = move;
      ghostMove.game = this.game;
      square.appendChild(ghostMove);
    }
  }

  removeGhostMoves() {
    const activeSquare = this.board.activeSquare;

    if (activeSquare) {
      activeSquare.classList.remove("active");
    }

    const ghostMoves = this.board.ghostMoves;
    for (let ghost of ghostMoves) {
      ghost.remove();
    }
  }

  handlePieceClick(event) {
    const pieceElement = event.currentTarget;
    const { player } = pieceElement.piece;
    if (this.game.getActivePlayer() !== player) {
      return;
    }

    if (!player.selectedPiece || player.selectedPiece === pieceElement.piece) {
      player.showMoves = !player.showMoves;
      player.selectedPiece = pieceElement.piece;
    }

    if (player.showMoves) {
      this.removeGhostMoves();
      this.placeGhostMoves(pieceElement);
      player.selectedPiece = pieceElement.piece;
    } else {
      this.removeGhostMoves();
      player.selectedPiece = null;
    }
  }
}
