<script lang="ts">
  import { declareWinner, displayReviewDialog, displayUndoMoveDialog } from "$lib/controllers/utils/dialog-utils";
  import type Game from "./Game.svelte";
  import type GameModel from "$lib/models/game";

  export let game: GameModel

  function handleDraw() {
    const activePlayer = game.getActivePlayer()
    const activeColor = activePlayer.color
    const opponentColor = activePlayer.opponent.color
      const drawMsg = `${activeColor} wishes to draw. ${opponentColor}, do you accept?`;
      displayReviewDialog(drawMsg, false);
  }

  function handleResign() {
    const activePlayer = game.getActivePlayer()
    const activeColor = activePlayer.color
    const opponentColor = activePlayer.opponent.color
    const resignMsg = `${activeColor} resigns. ${opponentColor} wins!`
    declareWinner(opponentColor, game, resignMsg)
  }

  function handleUndo() {
    displayUndoMoveDialog()
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
        <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 20 20"
          ><path
            fill="currentColor"
            fill-rule="evenodd"
            d="M7.793 2.232a.75.75 0 0 1-.025 1.06L3.622 7.25h10.003a5.375 5.375 0 0 1 0 10.75H10.75a.75.75 0 0 1 0-1.5h2.875a3.875 3.875 0 0 0 0-7.75H3.622l4.146 3.957a.75.75 0 0 1-1.036 1.085l-5.5-5.25a.75.75 0 0 1 0-1.085l5.5-5.25a.75.75 0 0 1 1.06.025Z"
            clip-rule="evenodd"
          /></svg
        >
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

  .icon {
    height: var(--element-size);
    weight: var(--font-weight);
  }
</style>
