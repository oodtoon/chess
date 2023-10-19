<script lang="ts">
  import { copyPgn, exportToPgn } from "$lib/io";
  import Dialog from "./Dialog.svelte";
  import ExitButton from "../icons/ExitButton.svelte";
  import CopyIcon from "../icons/CopyIcon.svelte";
  import { createEventDispatcher } from "svelte";
  import type { GameContext } from "$lib/context";
  import Trophy from "../icons/Trophy.svelte";
  import ExportIcon from "../icons/ExportIcon.svelte";
  import PlayAgainIcon from "../icons/PlayAgainIcon.svelte";

  const dispatch = createEventDispatcher();

  export let gameContext: GameContext;

  $: ({ game } = gameContext);

  let copied: boolean = false;

  const handlePlayAgain = () => {
    gameContext.reset();
  };

  const handleCopy = () => {
    copyPgn($game);
    copied = true;
    setTimeout(() => {
      copied = false;
    }, 4000);
  };

  const handleExport = () => {
    exportToPgn($game);
  };

  function close() {
    dispatch("close");
  }
</script>

<Dialog class="end-dialog" on:submit={close}>
  <ExitButton />

  <h1 class="title" id="end-title">
    <span class="reason">{$game.terminationReason}!</span>
    <span class="result">{$game.resultText}</span>
  </h1>

  <div class="trophy"><Trophy winner={$game.result} /></div>

  <span class="btn-container">
    <button class="play-again-btn" on:click={handlePlayAgain}
      ><span class="word">play again</span><span><PlayAgainIcon /></span
      ></button
    >

    <button class="export-btn" type="button" on:click={handleExport}
      ><span class="word">export pgn</span> <span><ExportIcon /></span></button
    >
    <button class="copy-btn" type="button" on:click={handleCopy}
      ><span class="word">copy pgn</span>
      <span class="copy-icon">
        <CopyIcon {copied} />
      </span></button
    >
  </span>
</Dialog>

<style>
  :global(.end-dialog > form) {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-areas:
      ". . exit"
      "title title title"
      ". trophy ."
      "btn btn btn";
    background-color: white;
  }

  .reason,
  .title {
    text-transform: capitalize;
  }

  .title {
    grid-area: title;
    justify-self: center;
  }

  .btn-container {
    grid-area: btn;
    justify-self: center;
    margin: 0em 1em 1em 1em;
    display: flex;
  }

  .btn-container > button {
    font-size: 1rem;
    font-weight: 800;
    margin: 0.25em;
    padding: 0.5em 1em;
    cursor: pointer;
    background-color: white;
    display: flex;
    gap: 1em;
  }

  .btn-container > button:hover {
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

  .export-btn {
    border: 3px solid brown;
    color: brown;
  }

  .copy-btn {
    border: 3px solid black;
    color: black;
  }



  .export-btn:hover {
    color: white;
    background-color: brown;
  }

  .copy-btn:hover {
    color: white;
    background-color: black;
  }

  .trophy {
    grid-area: trophy;
    justify-self: center;
    margin-bottom: 0.8rem;
  }
</style>
