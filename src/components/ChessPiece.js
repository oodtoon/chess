const template = document.querySelector("template");

export default class ChessPiece extends HTMLElement {
  constructor() {
    super();
    this.piece = null;
    this.clickHandler = this.clickHandler.bind(this);
  }

  connectedCallback() {
    this.setAttribute("draggable", "true");
    this.board = document.querySelector(".board");
    this.style.backgroundColor = "transparent";
    this.textContent = this.piece.icon;
    this.innerHTML = `<img src="${this.piece.class}" style="max-width: 100%;
    max-height: 100%;
    display: block;"
    class="piece-img"/>`;
    this.classList.add("piece");

    this.addEventListener("click", this.clickHandler);
    this.addEventListener("dragstart", console.log);

    window.eventBus.addEventListener("piece-move", (event) => {
      if (event.detail.pieceId !== this.piece.id) return;
      this.remove();
      const destination = this.board.getSquare(...event.detail.to);
      destination.appendChild(this);
    });
  }

  disconnectedCallback() {
    this.removeEventListener(this.clickHandler);
  }

  clickHandler() {
    if (
      !this.piece.player.selectedPiece ||
      this.piece.player.selectedPiece === this.piece
    ) {
      this.piece.player.showMoves = !this.piece.player.showMoves;
      this.piece.player.selectedPiece = this.piece;
    }

    if (this.piece.player.showMoves) {
      this.removeDot();
      this.placeDot();
      this.piece.player.selectedPiece = this.piece;
    } else {
      this.removeDot();
      this.piece.player.selectedPiece = null;
    }
  }

  placeDot() {
    for (let move of this.piece.moves) {
      const square = this.board.getSquare(move.row, move.file);
      const dot = document.createElement("div");

      dot.classList.add("dot");

      if (!square) {
        return;
      }

      const squareContent = square.getElementsByTagName("chess-piece");

      if (squareContent.length >= 1) {
        square.classList.add("container");
        dot.classList.add("crosshairs");
        const circ = document.createElement("div");
        circ.classList.add("circle");
        square.appendChild(dot);
        square.appendChild(circ);
      } else {
        dot.textContent = "•";
        square.appendChild(dot);
      }
    }
  }

  removeDot() {
    const dots = this.board.shadowRoot.querySelectorAll(".dot");
    for (let dot of dots) {
      dot.remove();
    }

    const circs = this.board.shadowRoot.querySelectorAll(".circle");
    for (let circ of circs) {
      circ.remove();
    }
  }

  isWhite(color) {
    return color === "white";
  }

  getDotIcon(color) {
    return this.isWhite(color) ? "•" : "◦";
  }
}

customElements.define("chess-piece", ChessPiece);
