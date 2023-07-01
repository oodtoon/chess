import Game from "../game.js";
import { intToFile } from "../util.js";

function generateTemplete() {
  const template = document.createElement("template");
  template.innerHTML = String.raw`
  <style>
    .square {
      width: var(--square-size);
      aspect-ratio: 1;
      font-size: calc(var(--square-size) * .75);
      text-align: center;
    }

    .black {
      background-color: brown;
    }

    .white {
      background-color: white;
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
    this.classList.add("board");
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this.game = new Game();
    this.mountPieces();
  }

  mountPieces() {
    this.mountPlayerPieces(this.game.whitePlayer);
    this.mountPlayerPieces(this.game.blackPlayer);
  }

  mountPlayerPieces(player) {
    for (let piece of player.livePieces) {
      const square = this.shadowRoot.querySelector(
        `[data-rank="${piece.row + 1}"][data-file="${intToFile(piece.file)}"]`
      );
      square.textContent = piece.icon;
    }
  }
}

window.customElements.define("chess-board", ChessBoard);
