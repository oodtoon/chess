const { parse } = window.PgnParser;

export function derivePgn(game) {
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

export function exportToPgn(game) {
  const pgn = derivePgn(game);
  const anchor = document.createElement("a");
  anchor.href = "data:text/plain;charset=utf-8," + encodeURIComponent(pgn);
  anchor.download = "chess_result.pgn";

  anchor.click();
}

export function copyPgn(game) {
  const pgn = derivePgn(game);
  navigator.clipboard.writeText(pgn);
}

export function parsePgn(pgn) {
  return parse(pgn)
}
