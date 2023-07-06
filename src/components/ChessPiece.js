const crossTemplate = document.createElement("template");
crossTemplate.innerHTML = String.raw`<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" class="ghost-move" viewBox="0 0 1024 1024"><path fill="currentColor" d="M512 896a384 384 0 1 0 0-768a384 384 0 0 0 0 768zm0 64a448 448 0 1 1 0-896a448 448 0 0 1 0 896z"></path><path fill="currentColor" d="M512 96a32 32 0 0 1 32 32v192a32 32 0 0 1-64 0V128a32 32 0 0 1 32-32zm0 576a32 32 0 0 1 32 32v192a32 32 0 1 1-64 0V704a32 32 0 0 1 32-32zM96 512a32 32 0 0 1 32-32h192a32 32 0 0 1 0 64H128a32 32 0 0 1-32-32zm576 0a32 32 0 0 1 32-32h192a32 32 0 1 1 0 64H704a32 32 0 0 1-32-32z"></path></svg>`;
const dotTemplate = document.createElement("template");
dotTemplate.innerHTML = String.raw`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" class="ghost-move" viewBox="0 0 256 256"><circle cx="127" cy="129" r="81" fill="currentColor" fill-rule="evenodd"/></svg>`;

export default class ChessPiece extends HTMLElement {
  constructor() {
    super();
    this.piece = null;
    this.clickHandler = this.clickHandler.bind(this);
  }

  connectedCallback() {
    this.setAttribute("draggable", false);
    this.board = document.querySelector(".board");

    this.style.backgroundImage = `url(${this.piece.img})`;
    this.textContent = this.piece.icon;

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
    this.removeEventListener("click", this.clickHandler);
  }

  clickHandler() {
    if (
      !this.piece.player.selectedPiece ||
      this.piece.player.selectedPiece === this.piece
    ) {
      this.piece.player.showMoves = !this.piece.player.showMoves;
      this.piece.player.selectedPiece = this.piece;
      console.log(this.piece);
    }

    if (this.piece.player.showMoves) {
      this.removeGhostMoves();
      this.placeGhostMoves();
      this.piece.player.selectedPiece = this.piece;
    } else {
      this.removeGhostMoves();
      this.piece.player.selectedPiece = null;
    }
  }

  placeGhostMoves() {
    this.parentNode.classList.add("active")
    for (let move of this.piece.moves) {
      const square = this.board.getSquare(move.row, move.file);

      if (!square) {
        return;
      }

      const squareContent = square.getElementsByTagName("chess-piece");

      if (squareContent.length >= 1) {
        const cross = crossTemplate.content.cloneNode(true);
        square.appendChild(cross);
      } else {
        const dot = dotTemplate.content.cloneNode(true);
        square.appendChild(dot);
      }
    }
  }

  removeGhostMoves() {
    const activeSquare = this.board.shadowRoot.querySelector(".active")
    if (activeSquare) {
      activeSquare.classList.remove("active")
    }
    const ghostMoves = this.board.shadowRoot.querySelectorAll(".ghost-move");
    for (let ghost of ghostMoves) {
      ghost.remove();
    }
  }
}

customElements.define("chess-piece", ChessPiece);
