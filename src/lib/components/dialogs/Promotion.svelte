<script lang="ts">
  import type GameModel from "$lib/models/game";
  import { closePromotionSelect } from "$lib/controllers/utils/dialog-utils";
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

  function handlePieceSelect() {
    closePromotionSelect();
  }
</script>

<dialog id="promotion-dialog" class="promotion-dialog">
  <form class="promotion-form">
    <span>
      {#each pieces as piece}
        <button
          on:click={handlePieceSelect}
          class="promote-btn"
          value={pieceSelector[piece]}
          style="background-image: url(https://images.chesscomfiles.com/chess-themes/pieces/neo/150/{color +
            piece}.png)">{piece}</button
        >
      {/each}
    </span>
  </form>
</dialog>

<style>
  .promotion-dialog {
    background-color: white;
    border-radius: 8px;
    border: 3px solid black;
  }

  .promotion-form {
    display: grid;
    grid-template-areas:
      "title"
      "btn";
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
