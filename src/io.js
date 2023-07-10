export function derivePgn(game) {
  let movesPgn = game.moves.reduce((acc, move, index) => {
    if (index % 2 === 0) {
      acc = acc + (Math.floor(index / 2) + 1) + "." + " ";
    }
    acc = acc + move.toString() + " ";
    return acc;
  }, "");

  if (game.isGameOver) {
    movesPgn = movesPgn + game.result
  }
  return movesPgn
}

export function exportToPgn(game) {
    const pgn = derivePgn(game)
    const anchor = document.createElement("a")
    anchor.href = "data:text/plain;charset=utf-8," + encodeURIComponent(pgn)
    anchor.download = "chess_result.pgn"

    anchor.click()
}

export function copyPgn(game) {
    const pgn = derivePgn(game)
    navigator.clipboard.writeText(pgn)
}


export function declareWinner(color, game, turn, modal, msg) {
    const title = modal.shadowRoot.getElementById("modal-title")
    modal.removeAttribute("hidden")
    if (color === "White") {
        game.result = "1-0"
        turn.textContent = "White wins!"
        title.textContent = msg
      } else {
        game.result = "0-1"
        turn.textContent = "Black wins!"
        title.textContent = msg
      }
}

export function offerDraw(modal, msg) {
    const title = modal.shadowRoot.getElementById("draw-title")
    modal.removeAttribute("hidden")
    title.textContent = msg
}

export function declareDraw(game, modal, msg = "Draw") {
    const title = modal.shadowRoot.getElementById("modal-title")
    modal.removeAttribute("hidden")
    title.textContent = msg
    game.result = "1/2-1/2"
}