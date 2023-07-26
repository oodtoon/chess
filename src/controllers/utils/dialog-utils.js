export function declareWinner(color, game, turn, modal, msg) {
  const title = modal.shadowRoot.getElementById("end-title");
  if (color === "White") {
    game.result = "1-0";
    turn.textContent = "White wins!";
    title.textContent = msg;
  } else {
    game.result = "0-1";
    turn.textContent = "Black wins!";
    title.textContent = msg;
  }
  const endDialog = modal.shadowRoot.getElementById("end-dialog");
  endDialog.showModal();
}

export function displayReviewDialog(
  dialog,
  title,
  type,
  msg = false,
  requestDialog
) {
  const reviewTitle = dialog.shadowRoot.getElementById("review-title");
  const reviewDialog = dialog.shadowRoot.getElementById("review-dialog");

  if (msg) {
    const msg = dialog.shadowRoot.getElementById("undo-review-msg");
    msg.textContent = requestDialog.msg;
    const dialogToClose =
      requestDialog.shadowRoot.getElementById("undo-dialog");
    dialogToClose.close();
    const textArea = requestDialog.shadowRoot.getElementById("undo-msg");
    textArea.value = null;
  }

  reviewDialog.showModal();
  dialog.type = type;
  reviewTitle.textContent = title;
}

export function closeDialog(dialog, type) {
  const id = type === "undo" ? "undo-dialog" : "review-dialog"
  const dialogToClose = dialog.shadowRoot.getElementById(id);
  dialogToClose.close();
}

export function declareDraw(
  game,
  dialog,
  msg = "Draw",
  currentDialog,
  movesList
) {
  if (currentDialog) {
    const current = currentDialog.shadowRoot.getElementById("review-dialog");
    current.close();
  }
  const title = dialog.shadowRoot.getElementById("end-title");
  const endDialog = dialog.shadowRoot.getElementById("end-dialog");
  endDialog.showModal();
  title.textContent = msg;
  game.result = "1/2-1/2";
  movesList.setResult(game.result);
}

export function displayUndoMoveDialog(modal) {
  const dialog = modal.shadowRoot.getElementById("undo-dialog");
  dialog.showModal();
}

export async function displayPromotionDialog(modal, playerColor) {
  const dialog = modal.shadowRoot.getElementById("promotion-dialog");
  modal.promoteBtns.forEach(
    (btn) =>
      (btn.style.backgroundImage = `url(https://images.chesscomfiles.com/chess-themes/pieces/neo/150/${
        playerColor + btn.value
      }.png)`)
  );
  dialog.showModal();

  const promise = new Promise((resolve, reject) => {

    const handlePromotionBtn = (event) => {
      resolve(event.target.id)
      closePromotionSelect(modal);
      modal.promoteBtns.forEach((btn) =>
        btn.removeEventListener("click", handlePromotionBtn)
      );
    };

    modal.promoteBtns.forEach((btn) =>
      btn.addEventListener("click", handlePromotionBtn)
    );
  });

  return promise;
}

export function closePromotionSelect(modal) {
  const dialog = modal.shadowRoot.getElementById("promotion-dialog");
  dialog.close();
}
