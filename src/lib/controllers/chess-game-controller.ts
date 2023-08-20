import EventBus from "../event-bus";
import {
  declareWinner,
  displayEndGameDialog,
  displayReviewDialog,
  displayUndoMoveDialog,
  displayPromotionDialog,
  closeDialog,
} from "./utils/dialog-utils";
import Game from "$lib/models/game";
import { copyPgn, exportToPgn, parsePgn } from "../io";
import { promote } from "$lib/models/pieces";
import type Player from "$lib/models/player";

const whitePieces = document.getElementById("white-pieces");
const blackPieces = document.getElementById("black-pieces");

function getPlayerCapturePool(player: Player) {
  return player.color === "White" ? whitePieces : blackPieces;
}

export default class ChessGameController {
  eventBus = new EventBus();

  constructor(selector = "") {
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
    this.handlePieceMove = this.handlePieceMove.bind(this);

    this.handleSquareClick = this.handleSquareClick.bind(this);
    this.handlePieceCapture = this.handlePieceCapture.bind(this);
    this.loading = false;
  }

  initialize() {
    this.initializeGame();
    this.attachSquareListeners();
    this.activateGameButtons();
    this.activateMoveListBtns();
    this.activateDialongBtns();
  }

  initializeGame() {
    this.mountPieces();
    this.eventBus.addEventListener("move", this.handlePieceMove);
  }

  cleanup() {
    this.eventBus.removeEventListener("move", this.handlePieceMove);
    this.dismountPieces();
  }

  handlePieceMove(event) {
    this.handleMove();
    this.updateMovesList(event);

    if (event.detail.move.isCompoundMove) {
      for (const move of event.detail.move.moves) {
        this.movePiece(move);
      }
    } else {
      this.movePiece(event.detail.move);
    }

    if (event.detail.move.capturedPiece) {
      this.handlePieceCapture(event);
    }
  }

  handleMove() {
    const activePlayer = this.game.getActivePlayer();

    this.checkForTerminalState(activePlayer);
    this.updatePlayerTurnAndText(activePlayer);
  }

  handleUndoMove() {
    const prevMove = this.game.lastMove;

    if (prevMove.isCompoundMove) {
      for (const move of prevMove) {
        this.movePiece(move, true);
        this.game.undoMove();
      }
    } else {
      this.movePiece(prevMove, true);
    }

    if (prevMove.capturedPiece) {
      this.undoPieceCapture(prevMove);
    }

    const piece = prevMove.initiatingPiece;

    if (
      piece.name === "Pawn" ||
      piece.name === "Rook" ||
      piece.name === "King"
    ) {
      if (
        !this.game.moves.find((move) => {
          return move.initiatingPiece === piece;
        })
      ) {
        piece.hasMoved = false;
      }
    }

    this.game.undoMove();
    this.movesList.removeMove();
    const prevPlayer = this.game.getActivePlayer().opponent;
    this.updatePlayerTurnAndText(prevPlayer);
  }

  movePiece(move, undo = false) {
    const { row, file, initiatingPiece, sourceRow, sourceFile } = move;

    const chessPieceElement = this.board.chessPieces.find(
      (element) => element.piece.id === initiatingPiece.id
    );

    const destinationSquare = undo ? [sourceRow, sourceFile] : [row, file];

    chessPieceElement.remove();
    const destination = this.board.getSquare(...destinationSquare);
    destination.appendChild(chessPieceElement);
  }

  checkForTerminalState(activePlayer) {
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
          this.movesList.setResult(this.game.result);
        } else {
          const stalemate = "Stalemate";
          displayEndGameDialog(this.game, this.endGameDialog, stalemate);
        }
        this.movesList.setResult(this.game.result);
      }, 500);
    }
  }

  updatePlayerTurnAndText(activePlayer) {
    this.rotateBoard(activePlayer);
    this.turn.textContent = `${activePlayer.opponent.color}'s Turn`;
  }

  handlePieceCapture(event) {
    const capturedPiece = this.board.chessPieces.find(
      (piece) => piece.piece.id === event.detail.move.capturedPiece.id
    );
    capturedPiece.remove();
    const capturedPieceBin = getPlayerCapturePool(capturedPiece.piece.player);
    capturedPieceBin.appendChild(capturedPiece);
  }

  undoPieceCapture(move) {
    const zombiePiece = move.capturedPiece;
    this.mountSinglePiece(zombiePiece);
    const capturedPieceBin = getPlayerCapturePool(zombiePiece.player);
    const zombieElement = capturedPieceBin.lastChild;
    capturedPieceBin.removeChild(zombieElement);
  }

  attachSquareListeners() {
    const squares = this.board.shadowRoot.querySelectorAll(".square");
    squares.forEach((square) => {
      square.addEventListener("click", this.handleSquareClick);
    });
  }

  activateGameButtons() {
    this.gameButtons.drawButton.addEventListener("click", () => {
      const activePlayer = this.game.getActivePlayer();
      const color = activePlayer.color;
      const opponentColor = activePlayer.opponent.color;

      const drawMsg = `${color} wishes to draw. ${opponentColor}, do you accept?`;

      displayReviewDialog(this.reviewDialog, drawMsg, "Draw");
    });

    this.gameButtons.resignButton.addEventListener("click", () => {
      const activePlayer = this.game.getActivePlayer();
      const color = activePlayer.color;
      const opponentColor = activePlayer.opponent.color;
      const resignMsg = `${color} resigns. ${opponentColor} wins!`;
      declareWinner(color, this.game, this.turn, this.endGameDialog, resignMsg);
      this.movesList.setResult(this.game.result);
    });

    this.gameButtons.undoButton.addEventListener("click", (event) => {
      displayUndoMoveDialog(this.undoDialog);
    });
  }

  activateMoveListBtns() {
    this.movesList.exportButton.addEventListener("click", () => {
      exportToPgn(this.game);
    });

    this.movesList.copyButton.addEventListener("click", () => {
      copyPgn(this.game);
    });

    this.movesList.importButton.addEventListener("click", () => {
      this.movesList.fileInput.click();
    });

    this.movesList.fileInput.addEventListener("change", (event) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        this.loading = true;
        this.cleanup();

        this.game = new Game(this.eventBus);
        this.initializeGame();

        const pgn = event.target.result;
        const parsedPgn = parsePgn(pgn);
        this.game.fromParsedToken(parsedPgn);
        this.loading = false;
      };
      reader.readAsText(event.target.files[0]);
    });
  }

  activateDialongBtns() {
    this.reviewDialog.acceptButton.addEventListener("click", () => {
      if (this.reviewDialog.type === "Draw") {
        this.game.result = "1/2-1/2";
        this.turn.textContent = "Draw";
        displayEndGameDialog(
          this.game,
          this.endGameDialog,
          "Draw",
          this.reviewDialog,
          this.movesList
        );
      } else {
        this.handleUndoMove();
        const dialog =
          this.reviewDialog.shadowRoot.getElementById("review-dialog");
        dialog.close();
      }
    });

    this.reviewDialog.declineButton.addEventListener("click", () => {
      closeDialog(this.reviewDialog);
    });

    this.undoDialog.requestButton.addEventListener("click", () => {
      const activePlayer = this.game.getActivePlayer();
      const color = activePlayer.opponent.color;
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
      closeDialog(this.undoDialog);
    });

    this.endGameDialog.playAgainButton.addEventListener("click", (event) => {
      const result = this.movesList?.shadowRoot?.querySelector(".result");
      result.remove();
      this.cleanup();

      this.game = new Game(this.eventBus);
      this.initializeGame();

      const endDialog =
        this.endGameDialog.shadowRoot.getElementById("end-dialog");
      endDialog.close();
    });

    this.endGameDialog.exportButton.addEventListener("click", () => {
      exportToPgn(this.game);
    });

    this.endGameDialog.copyButton.addEventListener("click", () => {
      copyPgn(this.game);
    });

    this.promotionDialog.pieceSelect.addEventListener("change", (event) => {
      event.preventDefault();
      this.promotionDialog.acceptButton.value =
        this.promotionDialog.pieceSelect.value;
    });
  }

  rotateBoard(activePlayer) {
    if (activePlayer !== this.game.whitePlayer) {
      this.board.setAttribute("rotate", "false");
    } else {
      this.board.setAttribute("rotate", "true");
    }
  }

  mountPieces() {
    this.mountPlayerPieces(this.game.whitePlayer);
    this.mountPlayerPieces(this.game.blackPlayer);
  }

  dismountPieces() {
    this.board.chessPieces.forEach((chessPieceElement) => {
      chessPieceElement.remove();
    });
  }

  mountPlayerPieces(player) {
    for (const piece of player.livePieces) {
      this.mountSinglePiece(piece);
    }
  }

  mountSinglePiece(piece) {
    const squareElement = this.board.getSquare(piece.row, piece.file);
    const chessPieceElement = document.createElement("chess-piece");
    chessPieceElement.piece = piece;
    squareElement.appendChild(chessPieceElement);
  }

  placeGhostMoves(pieceElement) {
    pieceElement.classList.add("active");
    for (const move of this.game.getMoves(pieceElement.piece)) {
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
    for (const ghost of ghostMoves) {
      ghost.remove();
    }
  }

  async moveHelper(move) {
    this.removeGhostMoves();

    if (
      move.initiatingPiece.isPawn() &&
      (move.row === 0 || move.row === 7) &&
      !this.loading
    ) {
      const selectedPiece = await displayPromotionDialog(this.promotionDialog);
      const pawnToPromote = move.initiatingPiece;
      const chessPieceElement = this.board.chessPieces.find(
        (element) => element.piece.id === pawnToPromote.id
      );
      const promatedPiece = promote(move, selectedPiece);
      move.pieceToPromoteTo = promatedPiece;
      this.game.doMove(move);
      chessPieceElement.remove();

      this.mountSinglePiece(promatedPiece);
    } else {
      this.game.doMove(move);
    }
  }

  handleSquareClick(event) {
    const square = event.currentTarget;
    const pieceElement = square.querySelector("chess-piece");
    const ghostElement = square.querySelector("ghost-move");

    if (pieceElement) {
      const { player } = pieceElement.piece;
      if (this.game.getActivePlayer() !== player && !ghostElement) {
        return;
      } else {
        this.removeGhostMoves();
        this.placeGhostMoves(pieceElement);
      }
    }

    if (ghostElement) {
      this.moveHelper(ghostElement.potentialMove);
    }

    if (!event.currentTarget.firstChild) {
      this.removeGhostMoves();
    }
  }
}
