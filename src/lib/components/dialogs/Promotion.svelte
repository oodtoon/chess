<script lang="ts">
  import type GameModel from "$lib/models/game";
  import Dialog from "./Dialog.svelte";
  export let game: GameModel;

  let color = game.getActivePlayer().color === "White" ? "w" : "b";

  let pieces: string[] = ["q", "n", "b", "r"];

  type piecesObj = {
    [key: string]: string;
  };

  let pieceSelector: piecesObj = {
    q: "Queen",
    n: "Knight",
    b: "Bishop",
    r: "Rook",
  };
</script>

<Dialog id="promotion-dialog">
    {#each pieces as piece}
      <!-- svelte-ignore missing-declaration -->
      <button
        class="promote-btn"
        value={pieceSelector[piece]}
        style="background-image: url(https://images.chesscomfiles.com/chess-themes/pieces/neo/150/{color +
          piece}.png)">{piece}</button
      >
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
