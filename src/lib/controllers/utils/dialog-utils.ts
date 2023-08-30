import openDialog from "$lib/components/dialogs";
import End from "$lib/components/dialogs/End.svelte";
import Promotion from "$lib/components/dialogs/Promotion.svelte";
import Review from "$lib/components/dialogs/Review.svelte";
import Undo from "$lib/components/dialogs/Undo.svelte";
import type { GameContext } from "$lib/context";

import type Game from "$lib/models/game";
import { get } from "svelte/store";

export async function displayEndGameDialog(gameContext: GameContext) {
  await openDialog(End, { gameContext });
}

export async function displayReviewDialog(title: string, content?: string) {
  return openDialog(Review, {
    title,
    content: content ?? "",
  });
}

export function closeDialog(id: string) {
  const dialogToClose = document.getElementById(id) as HTMLDialogElement;
  dialogToClose!.close();
}

export function openWaitingDialog(id: string) {
  const waitingDialog = document.getElementById(id) as HTMLDialogElement
  waitingDialog!.showModal()
}

export function getUndoTitle(color: string) {
  const opposingPlayer = color === "White" ? "Black" : "White";
  return `${color} requests to undo last move. ${opposingPlayer}, do you accept their plea?`;
}

export async function displayUndoMoveDialog(color: string) {
  const { accepted, message } = await openDialog(Undo);
  const title = getUndoTitle(color)
  if (accepted) {
    return { title, message: message || "I made an oopsie"}
  }
}

export async function displayPromotionDialog(gameContext: GameContext) {
  return openDialog(Promotion, { gameContext });
}

export function closePromotionSelect() {
  const dialog = document.getElementById(
    "promotion-dialog"
  ) as HTMLDialogElement;
  dialog!.close();
}

