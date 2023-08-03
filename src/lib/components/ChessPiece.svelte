<script lang="ts">
  import type { Piece } from "$lib/models/pieces";
  import { promotedPieceType } from "$lib/store";


  export let active: boolean;
  export let captured: boolean;
  export let piece: Piece | null;

  $: pieceType =
    $promotedPieceType &&
    piece?.isPawn() &&
    piece.row === $promotedPieceType.row &&
    piece.file === $promotedPieceType.file
      ? $promotedPieceType
      : piece;

</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
  class="piece"
  class:active
  class:captured
  style:background-image="url({pieceType?.img})"
  on:click
>
  {pieceType?.icon}
</div>

<style>
  .piece {
    color: transparent;
    aspect-ratio: 1;
    background-size: cover;
    height: 100%;
    width: 100%;
  }

  .active {
    background-color: rgba(241, 213, 155, 255);
  }

  .captured {
    width: var(--captured-piece-size);
    height: var(--captured-piece-size);
  }
</style>
