import EventBus from "../event-bus.js";
import Game from "../models/game.js";

const whitePieces = document.getElementById("white-pieces");
const blackPieces = document.getElementById("black-pieces");

function getPlayerCapturePool(player) {
  return player.color === "white" ? whitePieces : blackPieces;
}

export default class ChessGameController {
  eventBus = new EventBus();

  constructor(selector) {
    this.board = document.querySelector("chess-board" + selector);
    this.moveList = document.querySelector("moves-list");
    this.game = window.game = new Game(this.eventBus);
  }

  initialize() {
    this.mountPieces();
    this.eventBus.addEventListener(
      "piece-capture",
      this.handlePieceCapture.bind(this)
    );

    this.eventBus.addEventListener("piece-move", this.handleMove.bind(this));

    this.eventBus.addEventListener("piece-move", (event) => {
      if (this.moveList.currentListItem.children.length === 2) {
        this.moveList.nextListItem();
      }
      this.moveList.addMove(event.detail.notation);
    });

    this.eventBus.addEventListener("piece-move", (event) => {
      const chessPieceElement = this.board.chessPieces.find(
        (element) => element.piece.id === event.detail.pieceId
      );
      chessPieceElement.remove();
      const destination = this.board.getSquare(...event.detail.to);
      destination.appendChild(chessPieceElement);
    });
  }

  handleMove() {
    if (this.game.getActivePlayer() !== this.game.whitePlayer) {
      this.board.setAttribute("rotate", "false");
    } else {
      this.board.setAttribute("rotate", "true");
    }

    const activePlayer = this.game.getActivePlayer()

    const color = activePlayer.color
    if (activePlayer.opponent.moves.length === 0) {
      setTimeout(() => {
        if (this.game.isPlayerInCheck()) {
          window.alert(`Checkmate! ${color} player wins!`);
        } else {
          window.alert("stalemate :( I lost the game");
        }
      }, 500);
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
