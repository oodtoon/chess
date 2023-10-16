<script lang="ts">
  import type { Piece } from "$lib/models/pieces";
  import type { Color } from "$lib/type";
  import ChessPiece from "./ChessPiece.svelte";
 

  export let color: Color;
  export let capturedPieces: Piece[] | null[];

  let pawnImgUrl =
    color === "White"
      ? "https://www.chess.com/chess-themes/pieces/neo/150/wp.png"
      : "https://www.chess.com/chess-themes/pieces/neo/150/bp.png";
</script>


  <div class="team-icon" style:background-image="url({pawnImgUrl})">
    {color} Pawn
  </div>
  <p class="player-name">{color}</p>
  <div class="pieces">
    {#if capturedPieces.length > 0 && color !== capturedPieces[0]?.color}
      {#each capturedPieces as piece}
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
    margin: .2em 0;
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
