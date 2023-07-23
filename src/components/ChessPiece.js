class ChessPiece extends HTMLElement {
  constructor() {
    super();
    this.piece = null;
  }

  connectedCallback() {
    this.style.backgroundSize = "cover";
    this.style.color = "transparent";
    this.style.backgroundImage = `url(${this.piece.img})`;
    this.style.aspectRatio = "1";
    this.setAttribute("draggable", false);
    this.board = document.querySelector("chess-board");

    this.textContent = this.piece.icon;

    this.classList.add("piece");
    this.addEventListener("dragstart", console.log);
  }
}

customElements.define("chess-piece", ChessPiece);
