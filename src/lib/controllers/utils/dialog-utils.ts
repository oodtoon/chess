import openDialog from "$lib/components/dialogs";
import End from "$lib/components/dialogs/End.svelte";
import Promotion from "$lib/components/dialogs/Promotion.svelte";
import Review from "$lib/components/dialogs/Review.svelte";
import Undo from "$lib/components/dialogs/Undo.svelte";
import Waiting from "$lib/components/dialogs/Waiting.svelte";
import type { GameContext } from "$lib/context";

export async function displayEndGameDialog(gameContext: GameContext) {
  await openDialog(End, { gameContext });
}

export async function displayReviewDialog(title: string, content?: string) {
  const reviewResponse = await openDialog(Review, {
    title,
    content: content ?? "",
  });
  return reviewResponse;
}

export async function displayWaitingDialog(
  promise: Promise<void>,
  displayDeclineButton = false
) {
  await openDialog(Waiting, { promise, displayDeclineButton });
}

export function getUndoTitle(color: string) {
  const opposingPlayer = color === "White" ? "Black" : "White";
  return (
    `${color} requests to undo last move.` +
    "\n" +
    `${opposingPlayer}, do you accept their plea?`
  );
}

export async function displayUndoMoveDialog(color: string) {
  const { accepted, message } = await openDialog(Undo);
  const title = getUndoTitle(color);
  if (accepted) {
    return { title, content: message || "I made an oopsie" };
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
