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
import { promote } from "../models/pieces/index.mjs";

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
    this.handlePieceMove = this.handlePieceMove.bind(this);

    this.handleSquareClick = this.handleSquareClick.bind(this);
    this.handlePieceCapture = this.handlePieceCapture.bind(this);
  }

  initialize() {
    this.mountPieces();
    this.attachSquareListeners();
    this.activateGameButtons();
    this.activateMoveListBtns();
    this.activateDialongBtns();

    this.eventBus.addEventListener("move", this.handlePieceMove);
  }

  handlePieceMove(event) {
    this.handleMove();
    this.updateMovesList(event);

    if (event.detail.move.isCompoundMove) {
      for (let move of event.detail.move.moves) {
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

    if (this.game.board.willRotate) {
      this.updatePlayerTurnAndText(activePlayer);
    }
  }

  handleUndoMove() {
    const prevMove = this.game.lastMove;

    if (prevMove.isCompoundMove) {
      for (let move of prevMove) {
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
          move.initiatingPiece === piece;
        })
      ) {
        piece.hasMoved = false;
      }
    }

    this.game.undoMove();
    const prevPlayer = this.game.getActivePlayer().opponent;
    this.updatePlayerTurnAndText(prevPlayer, true);
  }

  updateMovesList(event) {
    if (this.movesList.currentListItem.children.length === 2) {
      this.movesList.nextListItem();
    }
    this.movesList.addMove(event.detail.move.toString());
  }

  movePiece(move, undo = false) {
    const { row, file, initiatingPiece, sourceRow, sourceFile } = move;

    const chessPieceElement = this.board.chessPieces.find(
      (element) => element.piece.id === initiatingPiece.id
    );

    const destinationSquare = undo ? [sourceRow, sourceFile] : [row, file];
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
        } else {
          const stalemate = "Stalemate";
          declareDraw(this.game, this.endGameDialog, stalemate);
        }
      }, 500);
      this.game.board.willRotate = false;
    }
  }

  updatePlayerTurnAndText(activePlayer, undo = false) {
    this.rotateBoard(undo);
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
        this.handleUndoMove();
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

      const promatedPiece = promote(
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

  rotateBoard(undo = false) {
    if (undo) {
      this.board.setAttribute("rotate", "true");
    } else {
      if (this.game.getActivePlayer() !== this.game.whitePlayer) {
        this.board.setAttribute("rotate", "false");
      } else {
        this.board.setAttribute("rotate", "true");
      }
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
