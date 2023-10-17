<script lang="ts">
  import type Player from "$lib/models/player";
  import ChessPiece from "./ChessPiece.svelte";

  export let player: Player;
  $: if (player) {
    console.log("active", player)
  }
  $: opponent = player.opponent;

  $: sortedCapturedPieces = opponent.capturedPieces.sort((a, b) => {
    return a?.value - b?.value;
  });

  $: totalValue = opponent.capturedPiecesValue - player.capturedPiecesValue;

  let pawnImgUrl =
    player.color === "White"
      ? "https://www.chess.com/chess-themes/pieces/neo/150/wp.png"
      : "https://www.chess.com/chess-themes/pieces/neo/150/bp.png";


</script>

<div class="team-icon" style:background-image="url({pawnImgUrl})">
  {player.color} Pawn
</div>

<p class="player-name">
  {player.color}
  {#if totalValue > 0}
    <span>Adv: +{totalValue}</span>
  {/if}
</p>
<div class="pieces">
  {#if opponent.capturedPieces.length > 0}
    {#each sortedCapturedPieces as piece}
      <ChessPiece {piece} active={false} captured />
    {/each}
  {/if}
</div>

<style>
  .pieces {
    grid-area: pieces;
    display: flex;
    flex-wrap: wrap;
    align-items: start;
  }
  .team-icon {
    grid-area: icon;
    color: transparent;
    background-color: white;
    border-radius: 8px;
    background-size: cover;
    height: var(--min-size);
    width: var(--min-size);
    aspect-ratio: 1;
  }

  .player-name {
    color: white;
    font-weight: 800;
    grid-area: name;
    margin: 0.2em 0;
    align-self: end;
  }

  @media (min-width: 1000px) and (max-height: 800px) {
    .pieces {
      align-self: start;
    }

    .player-name {
      align-self: start;
    }
  }
  @media (min-width: 1000px) and (min-height: 800px) {
    .pieces {
      max-height: 3em;
    }
  }
</style>
