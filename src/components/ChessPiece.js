import eventBus from "../event-bus.js";
class ChessPiece extends HTMLElement {
  constructor() {
    super();
    this.piece = null;
  }

  connectedCallback() {
    this.setAttribute("draggable", false);
    this.board = document.querySelector(".board");

    this.style.backgroundSize = "cover";
    this.style.color = "transparent";
    this.style.backgroundImage = `url(${this.piece.img})`
    this.style.aspectRatio = '1';
    this.textContent = this.piece.icon;

    this.classList.add("piece");
    this.addEventListener("dragstart", console.log);

    eventBus.addEventListener("piece-move", (event) => {
      if (event.detail.pieceId !== this.piece.id) return;
      this.remove();
      const destination = this.board.getSquare(...event.detail.to);
      destination.appendChild(this);
    });
  }

}

customElements.define("chess-piece", ChessPiece);
