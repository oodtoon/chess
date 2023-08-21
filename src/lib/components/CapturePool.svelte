<script lang="ts">
  import type { Piece } from "$lib/models/pieces";
  import type { Color } from "$lib/type";
  import ChessPiece from "./ChessPiece.svelte";


  export let color: Color;
  export let capturedPieces: Piece[] | null[];
</script>

<div class="capture-pool {color}">
  <h2>{color}'s Pieces Taken</h2>
  <div class="pieces">
    {#if capturedPieces.length > 0 && color !== capturedPieces[0]?.color}
      {#each capturedPieces as piece}
        <ChessPiece {piece} active={false} captured/>
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
