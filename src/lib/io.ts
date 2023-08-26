import { parse, type ParseTree } from "@mliebelt/pgn-parser";
import type Game from "./models/game";

export function derivePgn(game: Game) {
  let movesPgn = game.moves.reduce((acc, move, index) => {
    if (index % 2 === 0) {
      acc = acc + (Math.floor(index / 2) + 1) + "." + " ";
    }
    acc = acc + move.toString() + " ";
    return acc;
  }, "");

  if (game.isGameOver) {
    movesPgn = movesPgn + game.result;
  }

  return movesPgn;
}

export function derivePgnFromMoveStrings(arr: string[]) {
  let movesPgn = arr.reduce((acc: string, move: string, index: number) => {
    if (index % 2 === 0) {
      acc = acc + (Math.floor(index / 2) + 1) + "." + " ";
    }
    acc = acc + move.toString() + " ";
    return acc;
  }, "");
  return movesPgn;
}

export function exportToPgn(game: Game) {
  const pgn = derivePgn(game);
  const anchor = document.createElement("a");
  anchor.href = "data:text/plain;charset=utf-8," + encodeURIComponent(pgn);
  anchor.download = "chess_result.pgn";

  anchor.click();
}

export function copyPgn(game: Game) {
  const pgn = derivePgn(game);
  navigator.clipboard.writeText(pgn);
}

const parseTree: ParseTree[] = []

export function parsePgn(pgn: string) {
  return parse(pgn, {startRule: "pgn"}) as ParseTree;
}
