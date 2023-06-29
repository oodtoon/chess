import Piece from "./piece.mjs"

class Bishop extends Piece {
    static startingRows = [0, 7];
    static startingFiles = [2, 5];
  
    constructor(game, board, player, row, file) {
      super(game, board, player, row, file);
    }
  
    name = "Bishop";
  
    get moves() {
      const directions = [
        [-1, -1],
        [-1, 1],
        [1, -1],
        [1, 1],
      ];
      const available = directions.flatMap((dir) =>
        this.getLegalDirectionalMoves(dir)
      );
  
      return available;
    }
  
    onMove(move) {
      console.log(move);
    }
    get icon() {
      return this.isWhite() ? "♗" : "♝";
    }
  }

  export default Bishop