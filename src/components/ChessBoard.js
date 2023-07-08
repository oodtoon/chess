import eventBus from "../event-bus.js";
import Game from "../game.js";
import { intToFile } from "../util.js";

// const crossTemplate = document.createElement("template");
// crossTemplate.innerHTML = String.raw`<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" class="ghost-move" viewBox="0 0 1024 1024"><path fill="currentColor" d="M512 896a384 384 0 1 0 0-768a384 384 0 0 0 0 768zm0 64a448 448 0 1 1 0-896a448 448 0 0 1 0 896z"></path><path fill="currentColor" d="M512 96a32 32 0 0 1 32 32v192a32 32 0 0 1-64 0V128a32 32 0 0 1 32-32zm0 576a32 32 0 0 1 32 32v192a32 32 0 1 1-64 0V704a32 32 0 0 1 32-32zM96 512a32 32 0 0 1 32-32h192a32 32 0 0 1 0 64H128a32 32 0 0 1-32-32zm576 0a32 32 0 0 1 32-32h192a32 32 0 1 1 0 64H704a32 32 0 0 1-32-32z"></path></svg>`;
// const dotTemplate = document.createElement("template");
// dotTemplate.innerHTML = String.raw`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" class="ghost-move" viewBox="0 0 256 256"><circle cx="127" cy="129" r="81" fill="currentColor" fill-rule="evenodd"/></svg>`;
const whitePieces = document.getElementById("white-pieces");
const blackPieces = document.getElementById("black-pieces");

function getPlayerCapturePool(player) {
  return player.color === "white" ? whitePieces : blackPieces;
}

function generateTemplete() {
  const template = document.createElement("template");
  template.innerHTML = String.raw`
  <style>

    .square {
      width: var(--square-size);
      aspect-ratio: 1;
      font-size: calc(var(--square-size) * .75);
      text-align: center;
      position: relative;
      display: flex;
    }

    .black {
      background-color: brown;
    }

    .white {
      background-color: white;
    }

    .ghost-move {
      position: absolute;
      top: 50%;
      left: 50%;
      --translate: translate(-50%, -50%);
      transform: var(--translate);
      color: rgba(129, 133, 137, 0.6);
    }

    .ghost-move:hover {
      animation: pulse-circle 1.25s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
    }

    .piece {
      height: 100%;
      width: 100%;
    }

    .active {
      background-color: rgba(241,213,155, 255)
;
    }
    
    @keyframes pulse-circle {
      0% {
        transform: var(--translate) scale(1);
      }
      50% {
        transform: var(--translate) scale(.9);
      }
      100% {
        transform: var(--translate) scale(1);
      }
    }

  </style>
`;

  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const square = document.createElement("div");
      square.classList.add("square");
      square.classList.add(
        (rank % 2 === 0) ^ (file % 2 === 0) ? "white" : "black"
      );
      square.dataset.rank = rank + 1;
      square.dataset.file = intToFile(file);
      template.content.append(square);
    }
  }
  return template;
}

const template = generateTemplete();

class ChessBoard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this.squares = this.shadowRoot.querySelectorAll(".square")
    window.game = this.game = new Game();
  }

  connectedCallback() {
    this.classList.add("board");
    this.mountPieces();

    eventBus.addEventListener(
      "piece-capture",
      this.handlePieceCapture.bind(this)
    );

    eventBus.addEventListener("piece-move", this.handleMove.bind(this))
  }

  handleMove() {
    console.log("here")
    if (this.game.getActivePlayer() !== this.game.whitePlayer) {
      this.style.transform = ""
      this.squares.forEach(square => square.style.transform = "")
    } else {
      this.style.transform = "rotate(180deg)"
      this.squares.forEach(square => square.style.transform = "rotate(180deg)")
    }
  }

  handlePieceCapture(event) {
    const chessPieces = [...this.shadowRoot.querySelectorAll("chess-piece")];
    const captured = chessPieces.find(
      (piece) =>
        console.log(piece.piece.id, event.detail.pieceId) ??
        piece.piece.id === event.detail.pieceId
    );
    captured.remove();
    const forLater = getPlayerCapturePool(captured.piece.player);
    console.log(forLater);
    forLater.appendChild(captured);
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

  getSquare(row, file) {
    return this.shadowRoot.querySelector(
      `[data-rank="${row + 1}"][data-file="${intToFile(file)}"]`
    );
  }

  mountPlayerPieces(player) {
    for (let piece of player.livePieces) {
      const square = this.getSquare(piece.row, piece.file);
      const chessPiece = document.createElement("chess-piece");
      chessPiece.piece = piece;
      // TODO: add click handler for ghosts - chessPiece.addEventListener()
      chessPiece.addEventListener("click", this.handlePieceClick.bind(this));
      square.appendChild(chessPiece);
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

  placeGhostMoves(pieceHTML) {
    pieceHTML.classList.add("active");
    for (let move of pieceHTML.piece.moves) {
      const square = this.getSquare(move.row, move.file);

      if (!square) {
        return;
      }
      const ghostMove = document.createElement("ghost-move");
      ghostMove.addEventListener("click", () => {
        this.game.doMove(move);
        this.removeGhostMoves();
      });
      ghostMove.potentialMove = move;
      square.appendChild(ghostMove);
    }
  }

  removeGhostMoves() {
    const activeSquare = this.shadowRoot.querySelector(".active");

    if (activeSquare) {
      activeSquare.classList.remove("active");
    }

    const ghostMoves = this.shadowRoot.querySelectorAll(".ghost-move");
    for (let ghost of ghostMoves) {
      ghost.remove();
    }
  }
}

window.customElements.define("chess-board", ChessBoard);
