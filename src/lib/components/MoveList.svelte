<script lang="ts">
  import { exportToPgn, copyPgn, parsePgn } from "$lib/io";
  import { getGameContext } from "$lib/context";
  import type { ParseTree } from "@mliebelt/pgn-parser";
  import GameModel from "$lib/models/game";
  import CopyIcon from "./CopyIcon.svelte";


  let copied = false;

  let ctx = getGameContext();
  const { game, moveList } = ctx

  const handleExport = () => {
    exportToPgn($game)
  }

  const handleCopy = () => {
    copyPgn($game)
    copied = true;
    setTimeout(() => {
      copied = false;
    }, 4000);
  };


  const handleImport = () => {
    const fileInput = document.querySelector("#file-input") as HTMLInputElement
    fileInput!.click()
    
    fileInput.addEventListener("change", (event) => {
      const reader = new FileReader();
      reader.onload = (event) => {

        $game = new GameModel($game.eventBus);
  
        const pgn = event.target?.result as string
        const parsedPgn = parsePgn(pgn) as ParseTree
        $game.fromParsedToken(parsedPgn);
        
      };
      const files = (event.target as HTMLInputElement).files
      reader.readAsText(files![0])
    });
  }
</script>

<div class="moves-list">
    <h3>moves list</h3>
    <ol>
      {#each $moveList as move, i }
      {#if (i % 2 === 0)}
      <li>
        {#if i === 0}
          <span class="number">1.</span>
          {:else}
          <span class="number">{(i / 2) + 1}.</span>
        {/if}
        <span class="move">{move}</span>
        {#if $moveList[i +1]}
        <span class="move">{$moveList[i + 1]}</span>
        {/if}
      </li>
      {/if}
      {/each}
      <!-- svelte-ignore empty-block -->
      {#if $game.result} 
        <span class="game-result">Game Result: {$game.result}</span>
        {/if}
    </ol>


  <section class="btns-container">
    <button class="export" type="button" on:click={handleExport}>export pgn</button>
    <button class="copy" type="button" on:click={handleCopy}
      >copy pgn <span class="copy-icon">
        <CopyIcon {copied}/>
      </span>
    </button>
    <input type="file" id="file-input" style="display: none" />
    <button class="import" type="button" on:click={handleImport}>import pgn</button>
  </section>
</div>

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

  span {
    margin-left: 1em;
    display: inline-block;
  }

  .number {
    width: 10%;
  }

  .move {
    width: 30%;
  }

  li:nth-child(even) {
    background-color: white;
  }

  li:nth-child(even)::marker {
    background-color: white;
  }


  .game-result {
    margin: 0;
    display: flex;
    padding: .5em 0;
    justify-content: center;
  }


  .moves-list {
    grid-area: moves-list;
    display: block;
    border: 3px solid black;
    background-color: aliceblue;
    border-radius: 1em;
    margin-top: 3em;
    margin-bottom: auto;
    width: 100%;
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
</style>
