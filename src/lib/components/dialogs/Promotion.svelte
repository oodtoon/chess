<script lang="ts">
  import type { GameContext } from "$lib/context";
  import { createEventDispatcher } from "svelte";
  import Dialog from "./Dialog.svelte";

  interface $$Events {
    close: CustomEvent<string>;
  }

  export let gameContext: GameContext;

  const dispatch = createEventDispatcher();
  const { game } = gameContext;

  let color = $game.getActivePlayer().color === "White" ? "w" : "b";

  const pieces = ["q", "n", "b", "r"] as const;

  const pieceSelector = {
    q: "Queen",
    n: "Knight",
    b: "Bishop",
    r: "Rook",
  } as const;

  function close(piece: string) {
    dispatch("close", piece);
  }
</script>

<Dialog id="promotion-dialog">
  {#each pieces as piece}
    <!-- svelte-ignore missing-declaration -->
    <button
      class="promote-btn"
      on:click={() => close(pieceSelector[piece])}
      style="background-image: url(https://images.chesscomfiles.com/chess-themes/pieces/neo/150/{color +
        piece}.png)"
    />
  {/each}
</Dialog>

<style>
  :global(#promotion-dialog > form) {
    display: flex;
  }

  .promote-btn {
    border: transparent;
    background-color: transparent;
    color: transparent;
    background-size: cover;
    cursor: pointer;
    width: var(--responsive-size);
    height: var(--responsive-size);
    padding: 0;
    transition: transform 200ms;
    transform-origin: center;
  }
  .promote-btn:hover {
    transform: scale(1.1);
  }
  .promote-btn:active {
    transform: scale(1.05);
  }
</style>
