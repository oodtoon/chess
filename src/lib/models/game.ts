import Board from "./board.js";
import Player from "./player.js";
import { fileToInt } from "../util.js";
import { PIECE_NAME_MAPPING, Piece, type PieceName } from "./pieces/index.js";
import type Move from "./move.js";
import type EventBus from "$lib/event-bus.js";
import { CompoundMove, type BaseMove } from "./move.js";
import type { PgnGame, PgnReaderMove } from "@mliebelt/pgn-types";

export default class Game {
  #initialMoveId = Symbol(crypto.randomUUID());

  board = new Board(this);
  whitePlayer = new Player("White", this);
  blackPlayer = new Player("Black", this);

  moves: BaseMove[] = [];
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
    return moves.filter((move) => {
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

  stageMove(move: BaseMove, shouldCommitMove = true) {
    let moves: Move[];
    if (move instanceof CompoundMove) {
      moves = [move.kingMove, move.rookMove];
    } else {
      moves = [move as Move];
    }

    for (const move of moves) {
      const { row, file, initiatingPiece, capturedPiece } = move;

      if (capturedPiece) {
        const { row: capturedRow, file: capturedFile } = capturedPiece;
        this.board.set(capturedRow, capturedFile, null);
        capturedPiece.player.addCapturedPiece(capturedPiece);
        capturedPiece.player.removeLivePiece(capturedPiece);
      }
      const { row: initiatingRow, file: initiatingFile } = initiatingPiece!;
      this.board.set(initiatingRow, initiatingFile, null);
      this.board.set(row, file, initiatingPiece);
    }

    if (shouldCommitMove) {
      if (move instanceof CompoundMove) {
        move.kingMove.initiatingPiece.hasMoved = true;
        move.rookMove.initiatingPiece.hasMoved = true;
        move.kingMove.initiatingPiece.onMove(move);
      } else {
        move.initiatingPiece!.onMove(move);
      }
    }
  }

  unstageMove(move: BaseMove, shouldCommit: boolean = false) {
    if (move instanceof CompoundMove) {
      move.moves.forEach((move) => this.unstageMove(move, shouldCommit));
    } else {
      const {
        row,
        file,
        sourceRow,
        sourceFile,
        initiatingPiece,
        capturedPiece,
      } = move as Move;
      this.board.set(row, file, null);
      if (capturedPiece) {
        this.board.set(capturedPiece.row, capturedPiece.file, capturedPiece);
        capturedPiece.player.removeCapturedPiece(capturedPiece);
        capturedPiece.player.addLivePiece(capturedPiece);
      }
      this.board.set(sourceRow, sourceFile, initiatingPiece);

      if (shouldCommit) {
        if (
          initiatingPiece?.isPawn() ||
          initiatingPiece?.isRook() ||
          initiatingPiece?.isKing()
        ) {
          if (
            !this.moves.find(
              (move: BaseMove) => move.initiatingPiece === initiatingPiece
            )
          ) {
            initiatingPiece.hasMoved = false;
          }
        }
      }
    }
  }

  isMoveEnPassant(piece: Piece, move: Move) {
    return piece.isPawn() && piece.row !== move.row;
  }

  getActivePlayer() {
    return this.moves.length % 2 === 0 ? this.whitePlayer : this.blackPlayer;
  }

  doMove(move: BaseMove) {
    this.stageMove(move);
    this.moves.push(move);
  }

  undoMove() {
    if (!this.hasMoves) return;
    this.unstageMove(this.moves.at(-1)!, true);
    this.moves.pop();
  }

  get hasMoves() {
    return this.moves.length !== 0;
  }

  get lastMove() {
    return this.moves.at(-1);
  }

  isPlayerInCheck() {
    return this.hasMoves && this.lastMove!.isCheck;
  }

  //THIS HAS CHANGED. THERE ARE UNUSED LINES MAKE UPDATES BASED ON GIT TO HAVE CORRECT INFO
  fromParsedToken(pgn: PgnGame[]) {
    pgn[0].moves.forEach((token) => {
      console.log(token.notation.notation);
      if (token.notation.notation === "O-O") {
        if (token.turn === "w") {
          const shortObj = { row: 0, file: 6 };
        } else {
          const blackKing = this.blackPlayer.livePieceMap.King[0];
          const castleMove = this.getMoves(blackKing).find(
            (m) => m.isCompoundMove
          ) as CompoundMove;
          this.doMove(castleMove);
        }
      } else if (token.notation.notation === "O-O-O") {
        if (token.turn === "b") {
          const longObj = { row: 0, file: 2 };
        } else {
          const longObjectBlack = { row: 7, file: 2 };
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

const consumeToken = (token: PgnReaderMove, game: Game) => {
  const row = parseInt(token.notation.row!) - 1;
  const stringFile = token.notation.col;
  const file = fileToInt(stringFile);
  const player = token.turn === "w" ? game.whitePlayer : game.blackPlayer;

  const figMapping = Object.entries(player.livePieceMap).reduce(
    (acc, tuple) => {
      const [pieceName, pieces] = tuple;
      const pieceNotation = PIECE_NAME_MAPPING[pieceName as PieceName].notation;
      acc[pieceNotation!] = pieces;
      return acc;
    },
    {} as Record<string, Piece[]>
  );

  const pieceShortHand = !token.notation.fig ? "" : token.notation.fig;

  const movingPiece = getPieceToMove(
    figMapping[pieceShortHand],
    row,
    file,
    token.notation.disc
  );
  movePiece(movingPiece, game, row, file);
};

type Discriminate = (move: BaseMove) => boolean;

const getPieceToMove = (
  piecesOfType: Piece[],
  row: number,
  file: number,
  discriminator?: string | null
): Piece => {
  let discriminate: Discriminate = () => true;
  if (discriminator) {
    if (parseInt(discriminator)) {
      const discRow = parseInt(discriminator) - 1;
      discriminate = (move: BaseMove) => move.sourceRow === discRow;
    } else {
      const discFile = fileToInt(discriminator);
      discriminate = (move: BaseMove) => move.sourceFile === discFile;
    }
  }

  return piecesOfType.find((p: Piece) => {
    return p.moves.some(
      (m) => m.row === row && m.file === file && discriminate(m)
    );
  })!;
};

const movePiece = (piece: Piece, game: Game, row: number, file: number) => {
  if (piece) {
    const pieceMove = game
      .getMoves(piece)
      .find((m) => m.row === row && m.file === file);

    game.doMove(pieceMove!);
  }
};
