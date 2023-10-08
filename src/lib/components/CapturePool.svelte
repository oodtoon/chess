<script lang="ts">
  import type Player from "$lib/models/player";
  import ChessPiece from "./ChessPiece.svelte";

  export let player: Player
  $: opponent = player.opponent

  $: sortedCapturedPieces = opponent.capturedPieces.sort((a, b) => {
          return a?.value - b?.value;
        })

  $: totalValue = player.capturedPiecesValue - opponent.capturedPiecesValue;
</script>

<div class="capture-pool {player.color}">
  <p>{player.color}'s Pieces Taken</p>
  {#if totalValue > 0}
    <p>Adv: +{totalValue}</p>
  {/if}


  <div class="pieces">
    {#if opponent.capturedPieces.length > 0}
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

  .Black > p {
    color: #49a6e9;
    font-size: 25px;
    font-weight: 800;
  }

  .White {
    grid-area: captured-white;
    color: brown;
  }

  .White > p {
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
