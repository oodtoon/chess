<script lang="ts">
  import { copyPgn, exportToPgn } from "$lib/io";
  import Dialog from "./Dialog.svelte";
  import { createEventDispatcher } from "svelte";
  import type { GameContext } from "$lib/context";

  const dispatch = createEventDispatcher();

  export let gameContext: GameContext;
  
  $: ({ game } = gameContext)

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
  <button class="exit"
    ><svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      viewBox="0 0 1024 1024"
      ><path
        fill="currentColor"
        d="M195.2 195.2a64 64 0 0 1 90.496 0L512 421.504L738.304 195.2a64 64 0 0 1 90.496 90.496L602.496 512L828.8 738.304a64 64 0 0 1-90.496 90.496L512 602.496L285.696 828.8a64 64 0 0 1-90.496-90.496L421.504 512L195.2 285.696a64 64 0 0 1 0-90.496z"
      /></svg
    ></button
  >

  <h2 class="title" id="end-title">
    <span class="reason">{$game.terminationReason}!</span>
    <span class="result">{$game.resultText}</span>
  </h2>
  <span class="btn-container">
    <button class="play-again-btn" on:click={handlePlayAgain}
      >play again!</button
    >
    <button class="export-btn" type="button" on:click={handleExport}
      >export pgn</button
    >
    <button class="copy-btn" type="button" on:click={handleCopy}
      >copy pgn <span class="copy-icon">
        {#if !copied}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="icon"
            viewBox="0 0 16 16"
            ><path
              fill="currentColor"
              d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"
            /><path
              fill="currentColor"
              d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"
            /></svg
          >
        {:else}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="icon"
            viewBox="0 0 12 16"
            ><path
              fill-rule="evenodd"
              d="M12 5l-8 8l-4-4l1.5-1.5L4 10l6.5-6.5L12 5z"
              fill="currentColor"
            /></svg
          >
        {/if}
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

  .exit {
    grid-area: exit;
    justify-self: end;
    background-color: transparent;
    border: transparent;
    color: #8b0000;
    cursor: pointer;
  }

  .btn-container {
    grid-area: btn;
    justify-self: center;
    margin: 0em 1em 1em 1em;
  }

  .btn-container > button {
    font-size: 1rem;
    font-weight: 800;
    margin: 0.25em;
    padding: 0.5em 1em;
    cursor: pointer;
    background-color: white;
  }

  .btn-container > button:hover {
    box-shadow: 0.2em 0.2em 0.2em black;
  }

  .play-again-btn {
    border: 3px solid #49a6e9;
    color: #49a6e9;
  }

  .export-btn {
    border: 3px solid brown;
    color: brown;
  }

  .copy-btn {
    border: 3px solid black;
    color: black;
  }

  .play-again-btn:hover {
    color: white;
    background-color: #49a6e9;
  }

  .export-btn:hover {
    color: white;
    background-color: brown;
  }

  .copy-btn:hover {
    color: white;
    background-color: black;
  }

  .icon {
    height: var(--element-size);
    width: var(--element-size);
  }
</style>
