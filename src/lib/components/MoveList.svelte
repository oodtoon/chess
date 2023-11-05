<script lang="ts">
  import { exportToPgn, copyPgn, parsePgn } from "$lib/io";
  import { getGameContext } from "$lib/context";
  import type { ParseTree } from "@mliebelt/pgn-parser";
  import GameModel from "$lib/models/game";
  import CopyIcon from "./icons/CopyIcon.svelte";
  import ExportIcon from "./icons/ExportIcon.svelte";
  import ImportIcon from "./icons/ImportIcon.svelte";
  import Toast from "./dialogs/Toast.svelte";
  import PlayAgainButton from "./PlayAgainButton.svelte";

  export let minutes: number;

  let copied = false;

  let isError = false;

  let isToastClosed = false

  let ctx = getGameContext();
  const { game, moveList } = ctx;

  const handleExport = () => {
    exportToPgn($game);
  };

  const handleCopy = () => {
    copyPgn($game);
    copied = true;
    setTimeout(() => {
      copied = false;
    }, 4000);
  };

  function displayToast() {
    isToastClosed = false
    isError = true;

    setTimeout(() => {
      isError = false;
    }, 5000);
  }

  function handleCloseToast() {
    isToastClosed = true
  }

  const handleImport = async () => {
    const fileInput = document.querySelector("#file-input") as HTMLInputElement;
    fileInput!.click();

    fileInput.addEventListener("change", (event) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        $game = new GameModel($game.eventBus);

        const pgn = event.target?.result as string;
        try {
          const parsedPgn = parsePgn(pgn) as ParseTree;
          $game.fromParsedToken(parsedPgn);
        } catch {
          displayToast();
        }
      };
      const files = (event.target as HTMLInputElement).files;
      reader.readAsText(files![0]);
    });
  };
</script>

<div class="moves-list">
  <section class="moves">
    <h3>Game Notation</h3>
    <ol>
      {#each $moveList as move, i}
        {#if i % 2 === 0}
          <li>
            {#if i === 0}
              <span class="number">1.</span>
            {:else}
              <span class="number">{i / 2 + 1}.</span>
            {/if}
            <span class="move">{move}</span>
            {#if $moveList[i + 1]}
              <span class="move">{$moveList[i + 1]}</span>
            {/if}
          </li>
        {/if}
      {/each}
      {#if $game.result}
        <span class="game-result">Game Result: {$game.result}</span>
      {/if}
    </ol>
  </section>

  <section class="btns-container">
    <button class="export" type="button" on:click={handleExport}
      ><span class="word">export pgn</span> <span><ExportIcon /></span></button
    >
    <button class="copy" type="button" on:click={handleCopy}
      ><span class="word">copy pgn</span>
      <span class="copy-icon">
        <CopyIcon {copied} />
      </span>
    </button>
    <input type="file" id="file-input" style="display: none" />
    {#if ctx.mode === "local" && minutes === Infinity}
      <button class="import" type="button" on:click={handleImport}
        ><span class="word">import pgn</span>
        <span><ImportIcon /></span></button
      >
    {/if}
  </section>
  {#if $game.result}
    <section class="player-again-container">
      <PlayAgainButton on:playAgain/>
    </section>
  {/if}
</div>

{#if isError && !isToastClosed}
  <div class="toast">
    <Toast type={"importError"} on:dismiss={handleCloseToast}/>
  </div>
{/if}

<style>
  h3 {
    text-align: center;
  }

  ol {
    display: block;
    column-gap: 2rem;
    padding: 0;
    height: 15em;
    overflow-y: auto;
    overflow-x: hidden;
  }

  li {
    display: flex;
    padding: 0.25em 1em;
    width: 100%;
  }

  .number {
    width: 10%;
  }

  .move {
    width: 30%;
  }

  li:nth-child(even) {
    background-color: #3a3737;
  }

  li:nth-child(even)::marker {
    background-color: #3a3737;
  }

  .game-result {
    margin: 0;
    display: flex;
    padding: 0.5em 0;
    justify-content: center;
  }

  .moves {
    grid-area: moves;
  }


  .player-again-container {
    grid-area: play-again;
    align-self: start;
  }
  .moves-list {
    grid-area: moves-list;
    display: grid;
    background-color: #292727;
    color: white;
    margin-bottom: auto;
    width: 100%;
    grid-template-areas: "moves moves" "btns play-again";
  }

  .btns-container {
    display: flex;
    justify-content: center;
  }

  @media (min-width: 1000px) {
    .btns-container {
      display: grid;
      justify-content: start;
    }
  }

  .btns-container > button {
    font-size: var(--element-size);
    font-weight: 800;
    padding: 0.5em 1em;
    margin: auto 0.5em 1em 0.5em;
    background-color: white;
    border-radius: 1px;
    display: flex;
    gap: 1em;
  }

  .word {
    align-self: flex-end;
  }

  .export {
    border: 3px solid #49a6e9;
    color: #49a6e9;
  }

  .copy {
    border: 3px solid brown;
    color: brown;
  }

  .import {
    border: 3px solid black;
    color: black;
  }

  .btns-container > button:hover {
    color: white;
    cursor: pointer;
    box-shadow: 0.2em 0.2em 0.2em black;
  }

  .export:hover {
    background-color: #49a6e9;
  }

  .copy:hover {
    background-color: brown;
  }

  .import:hover {
    background-color: black;
  }

  .toast {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    width: 100%;
    display: flex;
    margin-top: 1rem;
    justify-content: center;
    flex-direction: column;
    z-index: 1000;
  }
</style>
