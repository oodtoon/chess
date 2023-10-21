<script lang="ts">
  import type { Piece } from "$lib/models/pieces";

  export let active: boolean;
  export let captured: boolean;
  export let piece: Piece | null;
  export let isSamePieceType = false
  export let isDisabled = false

  let livePiece = !captured;


</script>

<button
  class="piece"
  class:active
  class:captured
  class:livePiece
  class:isSamePieceType
  class:knight={piece?.name === "Knight"}
  style:background-image="url({piece?.img})"
  on:click
  data-flip-id="piece-{piece?.id}"
>
  {piece?.icon}
</button>

<style>
  .piece {
    position: relative;
    color: transparent;
    aspect-ratio: 1;
    background-size: cover;
    background-color: transparent;
    border: transparent;
    cursor: pointer;
    z-index: 1;
  }

  .knight {
    z-index: 45
  }
  .livePiece {
    height: 100%;
    width: 100%;
  }

  .active {
    background-color: rgba(241, 213, 155, 255);
  }
  .captured {
    width: 2rem;
    height: 2rem;
    cursor: auto;
    padding: 0em;
  }

  .isSamePieceType {
    margin-left: -1.65rem;
  }
</style>
