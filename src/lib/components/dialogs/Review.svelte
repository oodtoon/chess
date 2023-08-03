<script lang="ts">
  import {
    closeDialog,
    declareDraw,
  } from "$lib/controllers/utils/dialog-utils";

  import { isUndoMove, capturedBlackPieces, capturedWhitePieces, moveList } from "$lib/store";

  import { getGameContext } from "$lib/context";
  import type { BaseMove } from "$lib/models/move";
  import type GameModel from "$lib/models/game";

  let ctx = getGameContext();

  export let game: GameModel;

  function handleAccept() {
    const reviewTitle = document.getElementById("review-title")!.textContent;
    if (reviewTitle!.includes("draw")) {
      const msg = "Draw";
      declareDraw(game, msg, true);
    } else {
      if ($ctx.game.moves.length > 1) {
        $isUndoMove = true;
        const prevMove = $ctx.game.lastMove;
        const piece = prevMove?.initiatingPiece;

        if (prevMove?.capturedPiece) {
          const zombiePiece = prevMove.capturedPiece;
          if (zombiePiece.color === "White") {
            $ctx.game.whitePlayer.addLivePiece(zombiePiece)
            $ctx.game.whitePlayer.removeCapturedPiece(zombiePiece)
            $capturedWhitePieces.pop()
            $capturedWhitePieces = $capturedWhitePieces
          } else {
            $ctx.game.blackPlayer.addLivePiece(zombiePiece)
            $ctx.game.blackPlayer.removeCapturedPiece(zombiePiece)
            $capturedBlackPieces.pop()
            $capturedBlackPieces = $capturedBlackPieces
            
          }
        }

        $moveList.pop()
        $moveList = $moveList

        $ctx.game.undoMove();
        $ctx = $ctx;

        if (
          piece?.name === "Pawn" ||
          piece?.name === "Rook" ||
          piece?.name === "King"
        ) {
          console.log(piece)
          if (
            !$ctx.game.moves.find((move: BaseMove) => {
              return move.initiatingPiece === piece;
            })
          ) {
            piece.hasMoved = false;
          }
        }
      }
    }
    let id = "review-dialog";
    closeDialog(id);
  }

  function handleDecline() {
    let id = "review-dialog";
    closeDialog(id);
  }
</script>

<dialog id="review-dialog" class="review-dialog">
  <form class="review-form">
    <h2 class="title" id="review-title">Want to review?</h2>
    <div id="undo-review-msg" class="msg" />
    <span class="btn-container">
      <button
        class="accept"
        value="accpet"
        type="button"
        on:click={handleAccept}>Accept</button
      >
      <button
        class="decline"
        formmethod="dialog"
        type="button"
        on:click={handleDecline}>Decline</button
      >
    </span>
  </form>
</dialog>

<style>
  .review-dialog {
    background-color: white;
    border-radius: 8px;
    border: 3px solid black;
  }

  .review-form {
    display: grid;
    grid-template-areas:
      "title"
      "msg"
      "btn";
  }

  .title {
    grid-area: title;
    justify-self: center;
  }

  .msg {
    grid-area: msg;
    place-self: center;
  }

  .btn-container {
    grid-area: btn;
    justify-self: center;
    margin: 0em 1em 1em 1em;
  }

  .btn-container > button {
    font-size: 1rem;
    font-weight: 800;
    margin: 0.25em;
    padding: 0.5em 1em;
    cursor: pointer;
    background-color: white;
  }

  .btn-container > button:hover {
    box-shadow: 0.2em 0.2em 0.2em black;
  }

  .accept {
    border: 3px solid #49a6e9;
    color: #49a6e9;
  }

  .decline {
    border: 3px solid brown;
    color: brown;
  }

  .accept:hover {
    color: white;
    background-color: #49a6e9;
  }

  .decline:hover {
    color: white;
    background-color: brown;
  }
</style>
