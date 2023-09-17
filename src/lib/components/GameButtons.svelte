<script lang="ts">
  import { getGameContext } from "$lib/context";
  import UndoIcon from "./UndoIcon.svelte";

  import { createEventDispatcher } from "svelte";

  const gameContext = getGameContext();
  const { game } = gameContext;

  const dispatch = createEventDispatcher();

  async function handleDraw() {
    dispatch("draw");
  }

  function handleResign() {
    dispatch("resign", { accepted: true });
  }

  async function handleUndo() {
    dispatch("undo");
  }

  function handlePlayAgain() {
    gameContext.reset();
  }
</script>

<div>
  <section class="btns-container dual">
    <button class="draw" type="button" on:click={handleDraw}>Draw</button>
    <button class="resign" type="button" on:click={handleResign}>Resign</button>
  </section>
  <section class="btns-container">
    <button class="undo" type="button" on:click={handleUndo}>
      Undo Move
      <span>
        <UndoIcon />
      </span>
    </button>
    {#if $game.result}
      <button class="play-again-btn" on:click={handlePlayAgain}
        >Play Again</button
      >
    {/if}
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

  .btns-container > button:hover {
    color: white;
    cursor: pointer;
    box-shadow: 0em 0em 0em 0.1em white;
  }

  .draw {
    border: 3px solid #49a6e9;
    color: #49a6e9;
  }

  .draw:hover {
    background-color: #49a6e9;
  }

  .resign {
    border: 3px solid brown;
    color: brown;
  }

  .resign:hover {
    background-color: brown;
  }

  .undo {
    border: 3px solid black;
    color: black;
  }

  .undo:hover {
    background-color: black;
  }

  .play-again-btn {
    border: 3px solid #49a6e9;
    color: #49a6e9;
  }

  .play-again-btn:hover {
    color: white;
    background-color: #49a6e9;
  }
</style>
