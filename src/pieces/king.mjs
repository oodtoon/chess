import Piece from "./piece.mjs";
import Move from "../move.js"

class King extends Piece {
  static startingRows = [0, 7];
  static startingFiles = [4];

  constructor(game, board, player, row, file) {
    super(game, board, player, row, file);
    this.hasMoved = false;
    this.isChecked = false;
  }

  name = "King";

  setChecked() {
    this.isChecked = true;
  }

  setNotChecked() {
    this.isChecked = false;
  }

  // castleMove(row, file, arr, type) {
  //   const emptySquare = [];
  //   const currentSquare = [row, file];

  //   const direction = type === "short" ? 1 : -1;

  //   for (let i = 0; i < file; i++) {
  //     const nextSquare = [row, file + i * direction];
  //     if (!this.isSquareOccupied(...nextSquare)) {
  //       emptySquare.push(true);
  //     }
  //   }

  //   if (
  //     emptySquare.length === 3 &&
  //     this.isSquareOccupied(row, 0) === true &&
  //     this.getSquareContent(row, 0).name === "Rook" &&
  //     this.getSquareContent(row, 0).hasMoved === false &&
  //     this.getSquareContent(row, file).hasMoved === false
  //   ) {
  //     console.log("current", currentSquare)
  //     console.log("this", this)
  //     console.log("content", this.getSquareContent(row, 0))
  //     arr.push(
  //       Move.fromSquare(currentSquare, this, this.getSquareContent(row, 0))
  //     );
  //   } else if (
  //     emptySquare.length === 2 &&
  //     this.getSquareContent(row, 7).name === "Rook" &&
  //     this.getSquareContent(row, 0).hasMoved === false &&
  //     this.getSquareContent(row, file).hasMoved === false
  //   ) {
  //     arr.push(
  //       Move.fromSquare(currentSquare, this, this.getSquareContent(row, 7))
  //     );
  //   }
  //   return arr;
  // }

  get moves() {
    const directions = [
      [-1, -1],
      [-1, 1],
      [1, -1],
      [1, 1],
      [0, -1],
      [-1, 0],
      [0, 1],
      [1, 0],
    ];
    const available = directions.flatMap((dir) =>
      this.getLegalDirectionalMoves(dir, 1)
    );

    // this.castleMove(this.row, this.file, available, "long");
    // this.castleMove(this.row, this.file, available, "short")

    return available;
  }

  get icon() {
    return this.isWhite() ? "♔" : "♚";
  }

  onMove(move) {
    this.hasMoved = true;
  }
}

export default King;
