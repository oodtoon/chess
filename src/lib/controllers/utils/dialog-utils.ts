import openDialog from "$lib/components/dialogs";
import End from "$lib/components/dialogs/End.svelte";
import Promotion from "$lib/components/dialogs/Promotion.svelte";
import type { GameContext } from "$lib/context";

export async function displayEndGameDialog(gameContext: GameContext) {
  try {
    await openDialog(End, { gameContext });
  } catch {

  }


}


export function getUndoTitle(color: string) {
  const opposingPlayer = color === "White" ? "Black" : "White";
  return (
    `${color} requests to undo last move.` +
    "\n" +
    `${opposingPlayer}, do you accept their plea?`
  );
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
