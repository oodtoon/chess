import Board from "./board.js";
import Player from "./player.js";
import { fileToInt } from "../util.js";
import { PIECE_NAME_MAPPING, Piece } from "./pieces/index.js";
import type Move from "./move.js";
import type EventBus from "$lib/event-bus.js";

export default class Game {
  #initialMoveId = Symbol(crypto.randomUUID());

  board = new Board(this);
  whitePlayer = new Player("White", this);
  blackPlayer = new Player("Black", this);

  moves = [];
  result: string | null = null;

  constructor(readonly eventBus: EventBus) {
    this.wireUpOpposition();
    this.board.initialize();
  }

  wireUpOpposition() {
    this.whitePlayer.opponent = this.blackPlayer;
    this.blackPlayer.opponent = this.whitePlayer;
  }

  getMoves(piece: Piece) {
    const moves = piece?.moves;
    return moves.filter((move: Move) => {
      this.stageMove(move, false);
      if (move.doesMoveExposePlayerToCheck()) {
        this.unstageMove(move);
        return false;
      } else {
        this.unstageMove(move);
        return true;
      }
    });
  }

  stageMove(move: Move, shouldCommitMove = true) {
    let moves;
    if (move.isCompoundMove) {
      moves = [move.kingMove, move.rookMove];
    } else {
      moves = [move];
    }

    for (const move of moves) {
      const { row, file, initiatingPiece, capturedPiece } = move;

      if (capturedPiece) {
        const { row: capturedRow, file: capturedFile } = capturedPiece;
        this.board.set(capturedRow, capturedFile, null);
        capturedPiece.player.addCapturedPiece(capturedPiece);
        capturedPiece.player.removeLivePiece(capturedPiece);
      }
      const { row: initiatingRow, file: initiatingFile } = initiatingPiece;
      this.board.set(initiatingRow, initiatingFile, null);
      this.board.set(row, file, initiatingPiece);
    }

    if (shouldCommitMove) {
      if (move.isCompoundMove) {
        move.kingMove.initiatingPiece.hasMoved = true;
        move.rookMove.initiatingPiece.hasMoved = true;
        move.kingMove.initiatingPiece.onMove(move);
      } else {
        move.initiatingPiece.onMove(move);
      }
    }
  }

  unstageMove(move: Move) {
    if (move.isCompoundMove) {
      move.moves.forEach((move) => this.unstageMove(move));
    } else {
      const {
        row,
        file,
        sourceRow,
        sourceFile,
        initiatingPiece,
        capturedPiece,
      } = move;
      if (capturedPiece) {
        this.board.set(row, file, capturedPiece);
        capturedPiece.player.removeCapturedPiece(capturedPiece);
        capturedPiece.player.addLivePiece(capturedPiece);
      } else {
        this.board.set(row, file, null);
      }
      this.board.set(sourceRow, sourceFile, initiatingPiece);
    }
  }

  getActivePlayer() {
    return this.moves.length % 2 === 0 ? this.whitePlayer : this.blackPlayer;
  }

  doMove(move: Move, isCompound: boolean = false) {
    this.stageMove(move);

    if (isCompound) {
      if (move.initiatingPiece.name === "King") {
        this.moves.push(move);
      }
    } else {
      this.moves.push(move);
    }
  }

  undoMove() {
    this.unstageMove(this.moves.at(-1));
    this.moves.pop();
  }

  get lastMove() {
    return this.moves.at(-1);
  }

  isPlayerInCheck() {
    return this.lastMove.isCheck;
  }

  fromParsedToken(pgn) {
    console.log("these are all the moves", pgn[0].moves);
    pgn[0].moves.forEach((token) => {
      if (token.notation.notation === "O-O") {
        if (token.turn === "w") {
          const shortObj = { row: 0, file: 6 };
          console.log(shortObj);
        } else {
          const blackKing = this.blackPlayer.livePieceMap.King[0];
          const castleMove = this.getMoves(blackKing).find(
            (m) => m.isCompoundMove
          );
          this.doMove(castleMove);
        }
      } else if (token.notation.notation === "O-O-O") {
        if (token.turn === "b") {
          const longObj = { row: 0, file: 2 };
          console.log(longObj);
        } else {
          const longObjectBlack = { row: 7, file: 2 };
          console.log(longObjectBlack);
        }
      } else {
        consumeToken(token, this);
      }
    });
    console.log(this.board.debug());
  }

  get moveId() {
    return this.lastMove?.id ?? this.#initialMoveId;
  }

  get isGameOver() {
    return this.result !== null;
  }
}

const consumeToken = (token, game: Game) => {
  const row = parseInt(token.notation.row) - 1;
  const stringFile = token.notation.col;
  const file = fileToInt(stringFile);
  const player = token.turn === "w" ? game.whitePlayer : game.blackPlayer;

  const figMapping = Object.entries(player.livePieceMap).reduce(
    (acc, tuple) => {
      const [pieceName, pieces] = tuple;
      const pieceNotation = PIECE_NAME_MAPPING[pieceName].notation;
      acc[pieceNotation] = pieces;
      return acc;
    },
    {}
  );

  const movingPiece = getPieceToMove(
    figMapping[token.notation.fig],
    row,
    file,
    token.notation.disc
  );
  movePiece(movingPiece, game, row, file);
};

const getPieceToMove = (
  piecesOfType: Piece[],
  row: number,
  file: number,
  discriminator: string
) => {
  let discriminate = (move: Move) => true;
  if (discriminator) {
    if (parseInt(discriminator)) {
      const discRow = parseInt(discriminator) - 1;
      discriminate = (move: Move) => move.sourceRow === discRow;
    } else {
      const discFile = fileToInt(discriminator);
      discriminate = (move: Move) => move.sourceFile === discFile;
    }
  }
  return piecesOfType.find((p: Piece) => {
    return p.moves.some(
      (m: Move) => m.row === row && m.file === file && discriminate(m)
    );
  });
};

const movePiece = (piece: Piece, game: Game, row: number, file: number) => {
  if (piece) {
    const pieceMove = game
      .getMoves(piece)
      .find((m: Move) => m.row === row && m.file === file);

    game.doMove(pieceMove);
  }
};
