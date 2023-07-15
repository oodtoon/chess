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

export function displayReviewDialog(dialog, title, type, msg = false, requestDialog) {
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

export function declareDraw(game, dialog, msg = "Draw", currentDialog) {
    if (currentDialog) {
      const current = currentDialog.shadowRoot.getElementById("review-dialog");
      current.close();
    }
    const title = dialog.shadowRoot.getElementById("end-title");
    const endDialog = dialog.shadowRoot.getElementById("end-dialog");
    endDialog.showModal();
    title.textContent = msg;
    game.result = "1/2-1/2";
  }

export function displayUndoMoveDialog(modal) {
    const dialog = modal.shadowRoot.getElementById("undo-dialog");
    dialog.showModal();
  }

export function displayPromotionDialog(modal) {
    const dialog = modal.shadowRoot.getElementById("promotion-dialog");
    dialog.showModal();
  }

export function closePromotionSelect(modal) {
    const dialog = modal.shadowRoot.getElementById("promotion-dialog");
    dialog.close();
  }