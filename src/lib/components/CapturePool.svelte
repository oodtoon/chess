<script lang="ts">
  import type { Piece } from "$lib/models/pieces";
  import type { Color } from "$lib/type";
  import ChessPiece from "./ChessPiece.svelte";

  export let color: Color;
  export let capturedPieces: Piece[];

  $: sortedCapturedPieces =
    capturedPieces.length > 1
      ? capturedPieces.sort((a, b) => {
          return a?.value - b?.value;
        })
      : capturedPieces;

  $: playersCapturedValue = capturedPieces.reduce((acc, piece) => {
    acc = piece?.value! + acc;
    return acc;
  }, 0);
  $: opponentsCapturedValue = capturedPieces[0]
    ? capturedPieces[0].opponent.capturedPieces.reduce((acc, piece) => {
        acc = piece?.value! + acc;
        return acc;
      }, 0)
    : 0;
  $: totalValue = playersCapturedValue - opponentsCapturedValue;
</script>

<div class="capture-pool {color}">
  <h2>{color}'s Pieces Taken</h2>
  {#if totalValue > 0}
    <h3>Adv: +{totalValue}</h3>
  {/if}

  <div class="pieces">
    {#if capturedPieces.length > 0 && color !== capturedPieces[0]?.color}
      {#each sortedCapturedPieces as piece}
        <ChessPiece {piece} active={false} captured />
      {/each}
    {/if}
  </div>
</div>

<style>
  .Black {
    grid-area: captured-black;
    color: #49a6e9;
  }

  .Black > h2 {
    color: #49a6e9;
    font-size: 25px;
    font-weight: 800;
  }

  .White {
    grid-area: captured-white;
    color: brown;
  }

  .White > h2 {
    color: brown;
    font-size: 25px;
    font-weight: 800;
  }

  .White > .pieces {
    min-height: 100px;
    border: solid rgb(23, 23, 23) 5px;
    background-color: brown;
    display: flex;
    flex-wrap: wrap;
  }

  .Black > .pieces {
    min-height: 100px;
    border: solid rgb(23, 23, 23) 5px;
    background-color: #49a6e9;
    display: flex;
    flex-wrap: wrap;
  }
</style>
