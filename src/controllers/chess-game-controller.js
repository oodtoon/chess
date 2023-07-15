import EventBus from "../event-bus.js";
import {
  declareWinner,
  declareDraw,
  displayReviewDialog,
  displayUndoMoveDialog,
  displayPromotionDialog,
  closePromotionSelect,
} from "./utils/dialog-utils.js";
import Game from "../models/game.js";
import { copyPgn, exportToPgn } from "../io.js";

const whitePieces = document.getElementById("white-pieces");
const blackPieces = document.getElementById("black-pieces");

function getPlayerCapturePool(player) {
  return player.color === "White" ? whitePieces : blackPieces;
}

export default class ChessGameController {
  eventBus = new EventBus();

  constructor(selector) {
    this.board = document.querySelector("chess-board" + selector);
    this.game = window.game = new Game(this.eventBus);
    this.turn = document.getElementById("turn");

    this.gameButtons = document.querySelector("game-buttons");
    this.movesList = document.querySelector("moves-list");

    this.undoDialog = document.querySelector("undo-dialog");
    this.promotionDialog = document.querySelector("promotion-dialog");
    this.reviewDialog = document.querySelector("review-dialog");

    this.endGameDialog = document.querySelector("end-game-dialog");

    this.handleMove = this.handleMove.bind(this);
    this.handleSquareClick = this.handleSquareClick.bind(this);
    this.handlePieceCapture = this.handlePieceCapture.bind(this);

    this.handle;
  }

  initialize() {
    this.mountPieces();
    this.activateSquares();
    this.activateGameButtons()
    this.activateMoveListBtns()
    this.activateDialongBtns()

    this.eventBus.addEventListener("piece-capture", this.handlePieceCapture);

    this.eventBus.addEventListener("piece-move", this.handleMove);

    this.eventBus.addEventListener("piece-move", (event) => {
      if (this.movesList.currentListItem.children.length === 2) {
        this.movesList.nextListItem();
      }
      this.movesList.addMove(event.detail.notation);
    });

    this.eventBus.addEventListener("piece-move", (event) => {
      this.pieceMoveHelper(event)
    });
  }

  pieceMoveHelper(event) {
    const chessPieceElement = this.board.chessPieces.find(
      (element) => element.piece.id === event.detail.pieceId
    );

    const destinationSquare = event.detail.to;
    const destinationSquareRank = destinationSquare[0];

    chessPieceElement.remove();
    const destination = this.board.getSquare(...destinationSquare);
    destination.appendChild(chessPieceElement);

    if (
      chessPieceElement.piece.name === "Pawn" &&
      (destinationSquareRank === 7 || destinationSquareRank === 0)
    ) {
      this.game.board.willRotate = false;
      displayPromotionDialog(this.promotionDialog);
    }
  }

  handleMove() {
    const activePlayer = this.game.getActivePlayer();

    const color = activePlayer.color;
    if (activePlayer.opponent.moves.length === 0) {
      setTimeout(() => {
        if (this.game.isPlayerInCheck()) {
          const checkmate = `Checkmate! ${color} player wins!`;
          declareWinner(
            color,
            this.game,
            this.turn,
            this.endGameDialog,
            checkmate
          );
        } else {
          const stalemate = "Stalemate";
          declareDraw(this.game, this.endGameDialog, stalemate);
        }
      }, 500);
      this.game.board.willRotate = false;
    }

    if (this.game.board.willRotate === true) {
      this.rotateBoard();
      this.game.getActivePlayer();
      this.turn.textContent = `${activePlayer.opponent.color}'s Turn`;
    }
  }

  handlePieceCapture(event) {
    const capturedPiece = this.board.chessPieces.find(
      (piece) => piece.piece.id === event.detail.pieceId
    );
    capturedPiece.remove();
    const capturedPieceBin = getPlayerCapturePool(capturedPiece.piece.player);
    capturedPieceBin.appendChild(capturedPiece);
  }

  activateSquares() {
    const squares = this.board.shadowRoot.querySelectorAll(".square");
    squares.forEach((square) => {
      square.addEventListener("click", this.handleSquareClick);
    });
  }

  activateGameButtons() {
    this.gameButtons.drawButton.addEventListener("click", (event) => {
      event.preventDefault();

      const activePlayer = this.game.getActivePlayer();
      const color = activePlayer.color;
      const opponentColor = activePlayer.opponent.color;

      const drawMsg = `${color} wishes to draw. ${opponentColor}, do you accept?`;

      displayReviewDialog(this.reviewDialog, drawMsg, "Draw");
    });

    this.gameButtons.resignButton.addEventListener("click", (event) => {
      event.preventDefault();

      const activePlayer = this.game.getActivePlayer();
      const color = activePlayer.color;
      const opponentColor = activePlayer.opponent.color;
      const resignMsg = `${color} resigns. ${opponentColor} wins!`;
      declareWinner(color, this.game, this.turn, this.endGameDialog, resignMsg);
    });

    this.gameButtons.undoButton.addEventListener("click", (event) => {
      event.preventDefault();

      displayUndoMoveDialog(this.undoDialog);
    });
  }

  activateMoveListBtns() {
    this.movesList.exportButton.addEventListener("click", (event) => {
      event.preventDefault();
      exportToPgn(this.game);
    });

    this.movesList.copyButton.addEventListener("click", (event) => {
      event.preventDefault();
      copyPgn(this.game);
    });

    this.movesList.importButton.addEventListener("click", (event) => {
      event.preventDefault();
      console.log("import");
    });
  }

  activateDialongBtns() {

    this.reviewDialog.acceptButton.addEventListener("click", (event) => {
      event.preventDefault();

      if (this.reviewDialog.type === "Draw") {
        this.game.result = "1/2-1/2";
        this.turn.textContent = "Draw";
        declareDraw(this.game, this.endGameDialog, "Draw", this.reviewDialog);
      } else {
        console.log("accept undo move");
        const dialog =
          this.reviewDialog.shadowRoot.getElementById("review-dialog");
        dialog.close();
      }
    });

    this.reviewDialog.declineButton.addEventListener("close", (event) => {
      event.preventDefault();
    });



    this.undoDialog.requestButton.addEventListener("click", (event) => {
      event.preventDefault();

      const activePlayer = this.game.getActivePlayer();
      const color = activePlayer.color;
      const title = `${color} player wants to undo most recent move. Do you accept?`;
      displayReviewDialog(
        this.reviewDialog,
        title,
        "Undo move",
        true,
        this.undoDialog
      );
    });

    this.undoDialog.cancelButton.addEventListener("click", () => {
      const diag = this.undoDialog.shadowRoot.getElementById("undo-dialog");
      diag.close();
    });

    this.endGameDialog.playAgainButton.addEventListener("click", (event) => {
      event.preventDefault();

      const endDialog =
        this.endGameDialog.shadowRoot.getElementById("end-dialog");
      endDialog.close();
      console.log("play again");
    });

    this.endGameDialog.exportButton.addEventListener("click", (event) => {
      event.preventDefault();

      exportToPgn(this.game);
    });

    this.endGameDialog.copyButton.addEventListener("click", (event) => {
      event.preventDefault();

      copyPgn(this.game);
    });

    this.promotionDialog.pieceSelect.addEventListener("change", (event) => {
      event.preventDefault();
      this.promotionDialog.acceptButton.value =
        this.promotionDialog.pieceSelect.value;
    });

    this.promotionDialog.acceptButton.addEventListener("click", (event) => {
      event.preventDefault();

      const pawnToPromote = this.game.lastMove.initiatingPiece;
      const chessPieceElement = this.board.chessPieces.find(
        (element) => element.piece.id === pawnToPromote.id
      );

      closePromotionSelect(
        this.promotionDialog,
        this.promotionDialog.pieceSelect.value,
        pawnToPromote
      );
      chessPieceElement.remove();

      const promatedPiece = chessPieceElement.piece.promote(
        this.game.lastMove,
        this.promotionDialog.pieceSelect.value
      );

      this.mountSinglePiece(promatedPiece);

      setTimeout(() => {
        this.rotateBoard();
        this.game.board.willRotate = true;
      }, 700);
    });
  }

  rotateBoard() {
    if (this.game.getActivePlayer() !== this.game.whitePlayer) {
      this.board.setAttribute("rotate", "false");
    } else {
      this.board.setAttribute("rotate", "true");
    }
  }

  mountPieces() {
    this.mountPlayerPieces(this.game.whitePlayer);
    this.mountPlayerPieces(this.game.blackPlayer);
  }

  mountPlayerPieces(player) {
    for (let piece of player.livePieces) {
      this.mountSinglePiece(piece);
    }
  }

  mountSinglePiece(piece) {
    const squareElement = this.board.getSquare(piece.row, piece.file);
    const chessPieceElement = document.createElement("chess-piece");
    chessPieceElement.piece = piece;
    chessPieceElement.addEventListener("click", this.handlePieceClick);
    squareElement.appendChild(chessPieceElement);
  }

  placeGhostMoves(pieceElement) {
    pieceElement.classList.add("active");
    for (let move of this.game.getMoves(pieceElement.piece)) {
      const square = this.board.getSquare(move.row, move.file);
      const ghostMove = document.createElement("ghost-move");
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

  moveHelper(move) {
    this.removeGhostMoves();
    this.game.doMove(move);
  }

  handleSquareClick(event) {
    if (event.target.piece) {
      const pieceElement = event.target;
      const { player } = pieceElement.piece;
      if (this.game.getActivePlayer() !== player) {
        return;
      }

      if (
        !player.selectedPiece ||
        player.selectedPiece === pieceElement.piece
      ) {
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

    const ghostElements = this.board.shadowRoot.querySelectorAll("ghost-move");
    ghostElements.forEach((ghostElem) => {
      if (event.currentTarget.lastChild === ghostElem) {
        const move = event.currentTarget.lastChild.potentialMove;
        this.moveHelper(move);
      }
    });

    if (!event.currentTarget.firstChild) {
      this.removeGhostMoves();
    }
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
}
