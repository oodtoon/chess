import type Game from "$lib/models/game";
import type { Color } from "$lib/type";

export function declareWinner(
  color: Color,
  game: Game,
  turn: HTMLElement,
  modal: HTMLDialogElement,
  msg: string
) {
  const title = modal.shadowRoot!.getElementById("end-title") as HTMLElement;
  if (color === "White") {
    game.result = "1-0";
    turn.textContent = "White wins!";
    title.textContent = msg;
  } else {
    game.result = "0-1";
    turn.textContent = "Black wins!";
    title.textContent = msg;
  }
  const endDialog = modal.shadowRoot!.getElementById(
    "end-dialog"
  ) as HTMLDialogElement;
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

export function closeDialog(dialog) {
  const dialogToClose = dialog.shadowRoot.getElementById("review-dialog");
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

export async function displayPromotionDialog(modal) {
  const dialog = modal.shadowRoot.getElementById("promotion-dialog");
  dialog.showModal();

  const promise = new Promise((resolve, reject) => {
    const handleAccept = (event) => {
      event.preventDefault();

      resolve(modal.pieceSelect.value);
      closePromotionSelect(modal);
      modal.acceptButton.removeEventListener("click", handleAccept);
    };

    modal.acceptButton.addEventListener("click", handleAccept);
  });

  return promise;
}

export function closePromotionSelect(modal) {
  const dialog = modal.shadowRoot.getElementById("promotion-dialog");
  dialog.close();
}
