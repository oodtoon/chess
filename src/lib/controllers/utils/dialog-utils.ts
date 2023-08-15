import type Game from "$lib/models/game";
import type { Color } from "$lib/type";

export function declareWinner(color: Color, game: Game, msg: string) {
  const title = document.getElementById("end-title") as HTMLElement;
  const turn = document.getElementById("turn");
  const gameResult = document.querySelector(".game-result");
  if (color === "White") {
    game.result = "1-0";
    turn!.textContent = "White wins!";
    title.textContent = msg;
  } else {
    game.result = "0-1";
    turn!.textContent = "Black wins!";
    title.textContent = msg;
  }
  gameResult!.textContent = game.result;
  gameResult!.classList.remove("hidden");
  const endDialog = document.getElementById("end-dialog") as HTMLDialogElement;
  endDialog.showModal();
}

export function displayReviewDialog(title: string, isMsg: boolean) {
  const reviewTitle = document.getElementById("review-title");
  const reviewDialog = document.getElementById(
    "review-dialog"
  ) as HTMLDialogElement;

  if (isMsg) {
    const msg = document.getElementById("undo-review-msg");
    const dialogToClose = document.getElementById(
      "undo-dialog"
    ) as HTMLDialogElement;
    const undoMsg = document.getElementById("undo-msg") as HTMLTextAreaElement;
    if (undoMsg.value === "") {
      msg!.textContent = `"I made an oopsie"`;
    } else {
      msg!.textContent = `"${undoMsg!.value}"`;
    }
    dialogToClose?.close();
    undoMsg.value = "";
  }

  reviewTitle!.textContent = title;
  reviewDialog!.showModal();
}

export function closeDialog(id: string) {
  const dialogToClose = document.getElementById(id) as HTMLDialogElement;
  dialogToClose!.close();
}

export function declareDraw(
  game: Game,
  msg = "Draw",
  hasRequestDialog: boolean
) {
  if (hasRequestDialog) {
    const current = document.getElementById(
      "review-dialog"
    ) as HTMLDialogElement;
    current.close();
  }
  const title = document.getElementById("end-title");
  const endDialog = document.getElementById("end-dialog") as HTMLDialogElement;
  const gameResult = document.querySelector(".game-result");
  endDialog.showModal();
  title!.textContent = msg;
  game.result = "1/2-1/2";
  // I want to do this differently...
  gameResult!.textContent = game.result;
  gameResult!.classList.remove("hidden");
}

export function displayUndoMoveDialog() {
  const dialog = document.getElementById("undo-dialog") as HTMLDialogElement;
  dialog.showModal();
}


export async function displayPromotionDialog() {
  const promotionDialog = document.getElementById(
    "promotion-dialog"
  ) as HTMLDialogElement;
  promotionDialog.showModal();

  const promotionBtns = document.querySelectorAll(".promote-btn");

  const promise = new Promise((resolve, reject) => {
    const handlePromotionBtn = (event: Event) => {
      event.preventDefault();

      const target = event.target as HTMLButtonElement;
      if (target) {
        resolve(target.value);

        promotionBtns.forEach((btn) =>
          btn.removeEventListener("click", handlePromotionBtn)
        );
      }
    };

    promotionBtns.forEach((btn) =>
      btn.addEventListener("click", handlePromotionBtn)
    );
  });

  return promise;
}

export function closePromotionSelect() {
  const dialog = document.getElementById(
    "promotion-dialog"
  ) as HTMLDialogElement;
  dialog!.close();
}
