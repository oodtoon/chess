import openDialog from "$lib/components/dialogs";
import Promotion from "$lib/components/dialogs/Promotion.svelte";
import Review from "$lib/components/dialogs/Review.svelte";

import type Game from "$lib/models/game";
import type { Color } from "$lib/type";
import type { SvelteComponent } from "svelte";

export function declareWinner(color: Color, game: Game, msg: string) {
  const title = document.getElementById("end-title") as HTMLElement;
  const turn = document.getElementById("turn");
  if (color === "White") {
    game.result = "1-0";
    turn!.textContent = "White wins!";
    title.textContent = msg;
  } else {
    game.result = "0-1";
    turn!.textContent = "Black wins!";
    title.textContent = msg;
  }
  const endDialog = document.getElementById("end-dialog") as HTMLDialogElement;
  endDialog.showModal();
}

export function displayReviewDialog(title: string, hasMsg: boolean) {
  const reviewTitle = document.getElementById("review-title");
  const reviewDialog = document.getElementById(
    "review-dialog"
  ) as HTMLDialogElement;

  if (hasMsg) {
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
  // declareDraw(game, msg, true);
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

export async function displayUndoMoveDialog(game: Game) {
  const {accepted} = await openDialog<Review>(Review, { game });
  if (accepted) {
    game.undoMove();
  }

}

export async function displayPromotionDialog(game: Game) {
  return openDialog(Promotion, { game });
}

export function closePromotionSelect() {
  const dialog = document.getElementById(
    "promotion-dialog"
  ) as HTMLDialogElement;
  dialog!.close();
}
