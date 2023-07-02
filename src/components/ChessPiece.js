const template = document.querySelector("template");

export default class ChessPiece extends HTMLElement {
  constructor() {
    super();
    this.showMoves = false;
    this.piece = null;
  }

  connectedCallback() {
    this.setAttribute("draggable", "true");
    this.board = document.querySelector(".board");
    this.style.backgroundColor = "transparent";
    this.textContent = this.piece.icon;
    this.addEventListener("click", () => {
      this.showMoves = !this.showMoves;
    });
    this.addEventListener("dragstart", console.log);

    window.eventBus.addEventListener("piece-move", (event) => {
      if (event.detail.pieceId !== this.piece.id) return;
      debugger;
      this.remove();
      const destination = this.board.getSquare(...event.detail.to);
      destination.appendChild(this);
    });
  }
}

customElements.define("chess-piece", ChessPiece);
