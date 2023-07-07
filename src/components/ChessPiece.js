import eventBus from "../event-bus.js";
class ChessPiece extends HTMLElement {
  constructor() {
    super();
    this.piece = null;
    //this.clickHandler = this.clickHandler.bind(this);
  }

  connectedCallback() {
    this.setAttribute("draggable", false);
    this.board = document.querySelector(".board");

    this.style.backgroundImage = `url(${this.piece.img})`;
    this.textContent = this.piece.icon;

    this.classList.add("piece");

    //this.addEventListener("click", this.clickHandler);
    this.addEventListener("dragstart", console.log);

    eventBus.addEventListener("piece-move", (event) => {
      if (event.detail.pieceId !== this.piece.id) return;
      this.remove();
      const destination = this.board.getSquare(...event.detail.to);
      destination.appendChild(this);
    });
  }

  // disconnectedCallback() {
  //   this.removeEventListener("click", this.clickHandler);
  // }

  
}

customElements.define("chess-piece", ChessPiece);
