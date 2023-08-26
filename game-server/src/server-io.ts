import { parse } from "@mliebelt/pgn-parser";

export function formatAsPgnString(arr: string[]) {
  let movesPgn = arr.reduce((acc: string, move: string, index: number) => {
    if (index % 2 === 0) {
      acc = acc + (Math.floor(index / 2) + 1) + "." + " ";
    }
    acc = acc + move.toString() + " ";
    return acc;
  }, "");

  return movesPgn;
}

export function parsePgn(pgn: string) {
  return parse(pgn, {startRule: "pgn"});
}
