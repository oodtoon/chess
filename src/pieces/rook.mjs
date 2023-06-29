import Piece from "./piece.mjs"

class Rook extends Piece {
    static startingRows = [0, 7];
    static startingFiles = [0, 7];
  
    constructor(game, board, player, row, file) {
      super(game, board, player, row, file);
      this.hasMoved = false;
    }
  
    name = "Rook";
  
    get icon() {
      return this.isWhite() ? "♖" : "♜";
    }
  
    get moves() {
      const directions = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ];
      const available = directions.flatMap((dir) =>
        this.getLegalDirectionalMoves(dir)
      );
      return available;
    }
  
    onMove(move) {
      this.hasMoved = true;
    }
  }

  export default Rook