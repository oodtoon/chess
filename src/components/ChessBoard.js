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
      position: relative;
    }

    .black {
      background-color: brown;
    }

    .white {
      background-color: white;
    }

    .dot {
      position: absolute;
      top:50%;
      left:50%;
      transform: translate(-50%, -50%);
      font-size: 1.35em;
    }

    .bp {
      background-image: url(https://www.chess.com/chess-themes/pieces/neo/150/bp.png);
      background-size: contain;
    }

    .br {
      background-image: url(https://www.chess.com/chess-themes/pieces/neo/150/br.png);
      background-size: contain;
    }

    .bn {
      background-image: url(https://www.chess.com/chess-themes/pieces/neo/150/bn.png);
      background-size: contain;
    }

    .bb {
      background-image: url(https://www.chess.com/chess-themes/pieces/neo/150/bb.png);
      background-size: contain;
    }

    .bk {
      background-image: url(https://www.chess.com/chess-themes/pieces/neo/150/bb.png);
      background-size: contain;
    }

    .bq {
      background-image: url(https://www.chess.com/chess-themes/pieces/neo/150/bb.png);
      background-size: contain;
    }
    
    .wp {
      background-image: url(https://www.chess.com/chess-themes/pieces/neo/150/wp.png);
      background-size: contain;
    }

    .wr {
      background-image: url(https://www.chess.com/chess-themes/pieces/neo/150/wr.png);
      background-size: contain;
    }

    .wn {
      background-image: url(https://www.chess.com/chess-themes/pieces/neo/150/wn.png);
      background-size: contain;
    }

    .wb {
      background-image: url(https://www.chess.com/chess-themes/pieces/neo/150/wb.png);
      background-size: contain;
    }

    .wq {
      background-image: url(https://www.chess.com/chess-themes/pieces/neo/150/wq.png);
      background-size: contain;
    }

    .wk {
      background-image: url(https://www.chess.com/chess-themes/pieces/neo/150/wk.png);
      background-size: contain;
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
    this.game = new Game();
  }

  connectedCallback() {
    this.classList.add("board");
    this.mountPieces();
    this.testScenario();
  }

  testScenario() {
    const game = this.game;
    const whiteKing = game.board.get(0, 4);
    const blackKing = game.board.get(7, 4);
    const blackQueen = game.board.get(7, 3);
    const WPR = game.board.get(1, 5);
    const WPC = game.board.get(1, 4);
    const WPRR = game.board.get(1, 6);
    const BPL = game.board.get(6, 3);
    const BPLLL = game.board.get(6, 1);
    const BPLL = game.board.get(6, 2);
    const WK = game.board.get(0, 6);
    const BK = game.board.get(7, 1);
    const WB = game.board.get(0, 5);
    const BB = game.board.get(7, 2);

    game.doMove(game.getMoves(WPC)[0]);
    game.doMove(game.getMoves(BPL)[0]);
    game.doMove(game.getMoves(BB)[4]);
    game.doMove(game.getMoves(WB)[4]);
    // game.doMove(game.getMoves(WPR)[1]);
    // game.doMove(game.getMoves(BPLL)[1]);
    // game.doMove(game.getMoves(WPRR)[0]);
    // game.doMove(game.getMoves(BPLLL)[0]);
    // game.doMove(game.getMoves(WK)[1]);
    // game.doMove(game.getMoves(BK)[0]);
    // game.doMove(game.getMoves(WB)[0]);
    // game.doMove(game.getMoves(BB)[0]);
    // game.doMove(game.getMoves(WPC)[0]);
    // game.doMove(game.getMoves(blackQueen)[1]);
    // game.doMove(game.getMoves(whiteKing)[2]);
    // game.doMove(game.getMoves(blackKing)[1]);
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
      //square.classList.add(piece.class)
      square.appendChild(chessPiece);
    }
  }
}

window.customElements.define("chess-board", ChessBoard);
