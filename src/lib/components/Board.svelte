<script lang="ts">
  import { getGameContext } from "$lib/context";

  const gameCtx = getGameContext();
  const { game } = gameCtx;

  export let rotate: boolean;

  $: lastMove = $game.moves.at(-1);
</script>

<div class="boarder">
  <div class="board" class:rotate>
    {#each { length: 64 } as _, index}
      {@const row = Math.floor(index / 8)}
      {@const file = index % 8}
      {@const offset = row % 2}
      <div
        class="square"
        class:black={(index + offset) % 2 === 0}
        class:white={(index + offset) % 2 === 1}
        class:rotate
        style={rotate
          ? "border-width: 3px 8px 20px 8px"
          : "border-width: 20px 8px 3px 8px"}
      >
        {#if (lastMove?.sourceRow === row && lastMove?.sourceFile === file) || (lastMove?.row === row && lastMove?.file === file)}
          <div class="last-move-square-overlay" />
        {/if}
        <slot {row} {file} />
      </div>
    {/each}
  </div>
</div>

<style>
  .board,.boarder {
    width: calc(var(--responsive-size) * 8);
    height: calc(var(--responsive-size) * 8);
    min-width: calc(var(--min-size) * 8);
    min-height: calc(var(--min-size) * 8);
    place-self: center;
  }

  .board {
    display: flex;
    flex-wrap: wrap-reverse;
    place-self: start;
    border-radius: 4px;
    position: relative;
  }

  .boarder {
    position: relative;
    border: solid rgb(23, 23, 23) 5px;
  }

  .boarder::before {
    content: " ";
    position: absolute;
    top: -13px;
    bottom: -30px;
    left: -18px;
    right: -18px;
    border: solid;
    border-color: rgba(255, 255, 255, 0.16) rgba(255, 255, 255, 0.08);
    border-width: 3px 8px 20px 8px;
  }

  .square {
    position: relative;
    width: var(--responsive-size);
    min-width: var(--min-size);
    aspect-ratio: 1;
    font-size: calc(var(--responsive-size) * 0.75);
    text-align: center;
    z-index: 0;
    display: flex;
  }

  .black {
    background-color: brown;
  }

  .white {
    background-color: white;
  }

  .rotate {
    transform: rotate(180deg);
  }

  @media (min-width: 700px) {
    .square {
      width: var(--responsive-size);
    }
  }

  @media (min-width: 1000px) {
    .boarder, .board {
      place-self: center;
    }

    .square {
      width: var(--responsive-size);
      max-height: 88px;
      max-width: 88px;
      min-width: 50px;
      min-height: 50px;
    }
  }

  .last-move-square-overlay {
    background-color: #f39a6d;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: .75;
  }
  :global(.square:has(> .flipping)) {
    z-index: 1;
  }
</style>
