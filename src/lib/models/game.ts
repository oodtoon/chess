import Board from "./board.js";
import Player from "./player.js";
import { fileToInt } from "../util.js";
import {
  PIECE_NAME_MAPPING,
  Piece,
  promote,
  type PieceName,
} from "./pieces/index.js";
import type Move from "./move.js";
import type EventBus from "$lib/event-bus.js";
import { CompoundMove, type BaseMove } from "./move.js";
import type { PgnMove } from "@mliebelt/pgn-types";
import type { ParseTree } from "@mliebelt/pgn-parser";

type GameResult = "1-0" | "0-1" | "1/2-1/2" | null;
type GameTerminationReason =
  | "checkmate"
  | "stalemate"
  | "three-fold repitition"
  | "resignation"
  | "draw agreed"
  | null;
type GameTerminationOptions = {
  result: GameResult;
  reason: GameTerminationReason;
};

export default class Game {
  #initialMoveId = Symbol(crypto.randomUUID());

  board = new Board(this);
  whitePlayer = new Player("White", this);
  blackPlayer = new Player("Black", this);
  winner: Player | null = null;

  moves: BaseMove[] = [];
  result: GameResult = null;
  terminationReason: GameTerminationReason = null;

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
      const {
        row,
        file,
        initiatingPiece,
        capturedPiece,
        pieceToPromoteTo,
        isPromotion,
      } = move;

      if (capturedPiece) {
        const { row: capturedRow, file: capturedFile } = capturedPiece;
        this.board.set(capturedRow, capturedFile, null);
        capturedPiece.player.addCapturedPiece(capturedPiece);
        capturedPiece.player.removeLivePiece(capturedPiece);
      }
      const { row: initiatingRow, file: initiatingFile } = initiatingPiece!;
      this.board.set(initiatingRow, initiatingFile, null);

      if (isPromotion) {
        this.board.set(row, file, pieceToPromoteTo);
      } else {
        this.board.set(row, file, initiatingPiece);
      }
    }

    if (shouldCommitMove) {
      if (move instanceof CompoundMove) {
        move.kingMove.initiatingPiece!.hasMoved = true;
        move.rookMove.initiatingPiece!.hasMoved = true;
        move.kingMove.initiatingPiece!.onMove(move);
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
      this.board.set(sourceRow!, sourceFile!, initiatingPiece);

      if (shouldCommit) {
        if (
          initiatingPiece?.isPawn() ||
          initiatingPiece?.isRook() ||
          initiatingPiece?.isKing()
        ) {
          const firstMove = this.moves.find(
            (move: BaseMove) => move.initiatingPiece === initiatingPiece
          );
          if (!firstMove || firstMove === move) {
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
    this.stageMove(move, true);
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

  fromParsedToken(pgn: ParseTree) {
    pgn.moves.forEach((token) => consumeToken(token, this));
  }

  terminate(options: GameTerminationOptions) {
    this.result = options.result;
    this.terminationReason = options.reason;
  }

  get moveId() {
    return this.lastMove?.id ?? this.#initialMoveId;
  }

  get isGameOver() {
    return this.result !== null;
  }

  get resultText() {
    switch (this.result) {
      case null:
        return null;
      case "0-1":
        return "Black wins!";
      case "1-0":
        return "White wins!";
      case "1/2-1/2":
        return "Draw!";
    }
  }
}

export const consumeToken = (token: PgnMove, game: Game) => {
  if (
    token.notation.notation === "O-O" ||
    token.notation.notation === "O-O-O"
  ) {
    consumeCastleToken(token, game);
  } else {
    consumeStandardToken(token, game);
  }
};

const consumeCastleToken = (token: PgnMove, game: Game) => {
  let castleMove: CompoundMove;
  let castleType: string;
  let castlingKing: Piece;

  castleType = token.notation.notation;

  if (token.turn === "w") {
    castlingKing = game.whitePlayer.livePieceMap.King[0];
  } else {
    castlingKing = game.blackPlayer.livePieceMap.King[0];
  }
  castleMove = game
    .getMoves(castlingKing)
    .find(
      (m) => m.isCompoundMove && m.toString() === castleType
    ) as CompoundMove;

  game.doMove(castleMove);
};

const consumeStandardToken = (token: PgnMove, game: Game) => {
  const row = parseInt(token.notation.row!) - 1;
  const stringFile = token.notation.col;
  const file = fileToInt(stringFile);
  const player = token.turn === "w" ? game.whitePlayer : game.blackPlayer;
  const promoteType = token.notation.promotion;

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

  movePiece(movingPiece, game, row, file, promoteType);
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

const pieceSelector = {
  Q: "Queen",
  N: "Knight",
  B: "Bishop",
  R: "Rook",
} as const;

const movePiece = (
  piece: Piece,
  game: Game,
  row: number,
  file: number,
  promoteType: string | null
) => {
  console.log("movepiece");
  if (piece) {
    const pieceMove = game
      .getMoves(piece)
      .find((m) => m.row === row && m.file === file);

    if (promoteType) {
      const promotedPiece =
        pieceSelector[promoteType.slice(-1) as keyof typeof pieceSelector];
      pieceMove!.pieceToPromoteTo = promote(pieceMove!, promotedPiece, true);
    }

    game.doMove(pieceMove!);
  }
};
