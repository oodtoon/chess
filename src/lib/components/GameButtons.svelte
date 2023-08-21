<script lang="ts">
  import {
    displayEndGameDialog,
    displayReviewDialog,
    displayUndoMoveDialog,
  } from "$lib/controllers/utils/dialog-utils";
  import { getGameContext } from "$lib/context";
  import UndoIcon from "./UndoIcon.svelte";

  const gameContext = getGameContext();
  const { game } = gameContext;

  async function handleDraw() {
    const activePlayer = $game.getActivePlayer();
    const activeColor = activePlayer.color;
    const opponentColor = activePlayer.opponent.color;
    const drawMsg = `${activeColor} wishes to draw. ${opponentColor}, do you accept?`;
    const { accepted } = await displayReviewDialog(drawMsg);
    if (accepted) {
      $game.terminate({
        result: "1/2-1/2",
        reason: "draw agreed",
      });
      $game = $game;
      displayEndGameDialog(gameContext);
    }
  }

  function handleResign() {
    $game.terminate({
      result: $game.getActivePlayer().isWhite ? "0-1" : "1-0",
      reason: "resignation",
    });
    displayEndGameDialog(gameContext);
    $game = $game;
  }

  function handleUndo() {
    displayUndoMoveDialog(gameContext);
  }
</script>

<div>
  <section class="btns-container dual">
    <button class="draw" type="button" on:click={handleDraw}>Draw</button>
    <button class="resign" type="button" on:click={handleResign}>Resign</button>
  </section>
  <section class="btns-container">
    <button class="undo" type="button" on:click={handleUndo}
      >Undo Move <span>
        <UndoIcon />
      </span></button
    >
  </section>
</div>

<style>
  .btns-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    width: 100%;
  }

  .btns-container > button {
    font-size: 1rem;
    font-weight: 800;
    padding: 0.5em 1em;
    margin: auto 0.5em 1em 0.5em;
    background-color: white;
  }

  .draw {
    border: 3px solid #49a6e9;
    color: #49a6e9;
  }

  .resign {
    border: 3px solid brown;
    color: brown;
  }

  .undo {
    border: 3px solid black;
    color: black;
  }

  .btns-container > button:hover {
    color: white;
    cursor: pointer;
    box-shadow: 0em 0em 0em 0.1em white;
  }
  .draw:hover {
    background-color: #49a6e9;
  }

  .resign:hover {
    background-color: brown;
  }

  .undo:hover {
    background-color: black;
  }
</style>
