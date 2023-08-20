import type Game from "./game";
import { Pawn, Rook, Knight, Bishop, Queen, King, Piece } from "./pieces";
import type Player from "./player";

type PieceConstructor = {
  startingRows: number[];
  startingFiles: number[];
} & (new (
  game: Game,
  board: Board,
  player: Player,
  row: number,
  file: number
) => Piece);

type BoardEntry = Piece | null
type BoardGrid = BoardEntry[][]

export default class Board {
  static LANE_SIZE = 8;
  #board: BoardGrid = [];

  constructor(private readonly game: Game) {
    for (let i = 0; i < Board.LANE_SIZE; i++) {
      const file = new Array(Board.LANE_SIZE).fill(null);
      this.#board[i] = file;
    }
  }

  initializePiece(PieceConstructor: PieceConstructor) {
    for (const row of PieceConstructor.startingRows) {
      const player = row <= 2 ? this.game.whitePlayer : this.game.blackPlayer;
      for (const file of PieceConstructor.startingFiles) {
        const p = new PieceConstructor(this.game, this, player, row, file);
        this.#board[row][file] = p;
        player.addLivePiece(p);
      }
    }
  }

  initialize() {
    this.initializePiece(Pawn);
    this.initializePiece(Rook);
    this.initializePiece(Bishop);
    this.initializePiece(Queen);
    this.initializePiece(King);
    this.initializePiece(Knight);
  }

  getSquareContent(row: number, file: number) {
    return this.#board[row][file];
  }

  isValidSquare(row: number, file: number) {
    return (
      row >= 0 && row < Board.LANE_SIZE && file >= 0 && file < Board.LANE_SIZE
    );
  }

  isSquareOccupied(row: number, file: number) {
    const squareContent = this.getSquareContent(row, file);
    return squareContent !== null;
  }

  set(row: number, file: number, value: Piece | null) {
    this.#board[row][file] = value;
    if (value) {
      value.row = row;
      value.file = file;
    }
  }

  get(row: number, file: number) {
    return this.#board[row][file];
  }

  debug() {
    const debugStr = this.#board
      .map((row) =>
        row.map((piece) => (piece === null ? " " : piece.icon)).join("")
      )
      .reverse()
      .join("\n");

    console.log(debugStr);
  }
}
