<script lang="ts">
  import type { Piece } from "$lib/models/pieces";

  export let active: boolean;
  export let captured: boolean;
  export let piece: Piece | null;
  export let contentRect = null
</script>

<button
  class="piece"
  class:active
  class:captured
  style:background-image="url({piece?.img})"
  on:click
  bind:contentRect
>
  {piece?.icon}
</button>

<style>
  .piece {
    color: transparent;
    aspect-ratio: 1;
    background-size: cover;
    height: 100%;
    width: 100%;
    background-color: transparent;
    border: transparent;
    cursor: pointer;
  }

  .active {
    background-color: rgba(241, 213, 155, 255);
  }

  .captured {
    width: var(--captured-piece-size);
    height: var(--captured-piece-size);
  }
</style>
