import openDialog from "$lib/components/dialogs";
import End from "$lib/components/dialogs/End.svelte";
import Join from "$lib/components/dialogs/Join.svelte";
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

function getUndoTitle(game: Game) {
  const activePlayer = game.getActivePlayer();
  const reviewColor = activePlayer.color;
  const requestingColor = activePlayer.opponent.color;
  return `${requestingColor} is requesting to undo the last move. ${reviewColor} do you accept their plea?`;
}

export async function displayUndoMoveDialog(gameContext: GameContext) {
  const { accepted, message } = await openDialog(Undo);
  if (accepted) {
    const { game } = gameContext;

    await openDialog(Review, {
      title: getUndoTitle(get(game)),
      content: message || "I made an oopsie",
    });

    game.update(($game) => {
      $game.undoMove();
      return $game;
    });
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


