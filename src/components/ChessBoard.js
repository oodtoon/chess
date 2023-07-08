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

    chess-piece {
      height: 100%;
      width: 100%;
    }

    .active {
      background-color: rgba(241,213,155, 255);
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
  static get observedAttributes() {
    return ["rotate"]
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this.squares = this.shadowRoot.querySelectorAll(".square");
  }

  connectedCallback() {
  }

  attributeChangedCallback(name, oldValue, newValue) {
    console.log([name, oldValue, newValue])
    if (newValue === "true") {
      this.style.transform = "rotate(180deg)";
      this.squares.forEach(
        (square) => (square.style.transform = "rotate(180deg)")
      );
    } else {
      this.style.transform = "";
      this.squares.forEach((square) => (square.style.transform = ""));
    }
  }

  getSquare(row, file) {
    return this.shadowRoot.querySelector(
      `[data-rank="${row + 1}"][data-file="${intToFile(file)}"]`
    );
  }

  get chessPieces() {
    return [...this.shadowRoot.querySelectorAll("chess-piece")]
  }

  get activeSquare() {
    return this.shadowRoot.querySelector(".active")
  }

  get ghostMoves() {
    return [...this.shadowRoot.querySelectorAll(".ghost-move")];
  }
}

window.customElements.define("chess-board", ChessBoard);
