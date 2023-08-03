<script lang="ts">
  import { moveList } from "$lib/store";
  import { exportToPgn, copyPgn, parsePgn } from "$lib/io";
  import { getGameContext } from "$lib/context";
  import GameModel from "$lib/models/game";

  export let game: GameModel
  let copied = false;

  let ctx = getGameContext();

  const handleExport = () => {
    exportToPgn(game)
  }

  const handleCopy = () => {
    copyPgn(game)
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
      
        $ctx.game = new GameModel($ctx.game.eventBus);
  
        const pgn = event.target?.result;
        const parsedPgn = parsePgn(pgn);
        console.log(parsedPgn)
        $ctx.game.fromParsedToken(parsedPgn);
        
      };
      reader.readAsText(event.target?.files[0]);
    });
  }
</script>

<div class="moves-list">
  <h3>moves list</h3>
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
    <li class="li-result"><span class="hidden game-result" /></li>
  </ol>

  <section class="btns-container">
    <button class="export" type="button" on:click={handleExport}>export pgn</button>
    <button class="copy" type="button" on:click={handleCopy}
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

  .li-result {
    display: flex;
    padding: 0;
    justify-content: center;
  }

  .game-result {
    margin: 0;
  }
  .hidden {
    display: none;
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

  .icon {
    height: var(--element-size);
    width: var(--element-size);
  }
</style>
