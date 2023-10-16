<script lang="ts">
  import { getGameContext } from "$lib/context";
  import PlayAgainIcon from "./icons/PlayAgainIcon.svelte";

  let gameContext = getGameContext();

  function handlePlayAgain() {
    gameContext.reset();
  }
</script>

<button class="play-again-btn" on:click={handlePlayAgain}
  ><span class="word">play again</span><span><PlayAgainIcon /></span></button
>

<style>
  button {
    font-size: 1rem;
    font-weight: 800;
    margin: 0.25em;
    padding: 0.5em 1em;
    cursor: pointer;
    background-color: white;
    display: flex;
    gap: 1em;
    margin: 2em auto;
  }

  button:hover {
    box-shadow: 0.2em 0.2em 0.2em black;
  }

  .word {
    align-self: flex-end;
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
