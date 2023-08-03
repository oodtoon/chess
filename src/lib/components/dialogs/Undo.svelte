<script lang="ts">
      import {
    closeDialog,
    displayReviewDialog,
  } from "$lib/controllers/utils/dialog-utils";
  import type GameModel from "$lib/models/game";

  export let game: GameModel

  function handleUndoRequest() {
        const activePlayer = game.getActivePlayer()
        const reviewColor = activePlayer.color
        const requestingColor = activePlayer.opponent.color
        const msg = `${requestingColor} is requesting to undo the last move. ${reviewColor} do you accept their plea?`
        let id = "undo-dialog"
        closeDialog(id)
        displayReviewDialog(msg, true)
    
  }

  function handleDecline() {
    let id = "undo-dialog"
    closeDialog(id);
  }

</script>

<dialog class="undo-dialog" id="undo-dialog">
    <form class="undo-form">
       <h2 class="title" id="undo-title">Send undo move request to opponent for approval.</h2>
       <section class="input">
           <label>Message to opponent:
           <textarea id="undo-msg"></textarea>
           </label>
       </section>
       
       <span class="btn-container">
           <button class="request" type="button" on:click={handleUndoRequest}>Send Undo Request</button>
           <button class="cancel" formmethod="dialog" type="button" on:click={handleDecline}>Cancel</button>
       </span>
    </form>
</dialog>

<style>
   .undo-dialog {
   border-radius: 8px;
    border: 3px solid black;
    align-items: start;
    justify-content: center;
    padding: 1em;
   }

 .undo-form {
    display: grid;
    grid-template-areas: 
    "title title"
    "input btn";
    background-color: white;

 }

 .title {
    grid-area: title;
    place-self: center;
 }

 .input {
    grid-area: input;
 }

 .btn-container {
    grid-area: btn;
    justify-self: center;
    margin: 0em 1em 1em 1em;
 }

 .btn-container > button {
    font-size: 1rem;
    font-weight: 800;
    margin: .25em;
    padding: .5em 1em;
    cursor: pointer;
    background-color: white;
 }

 .btn-container > button:hover {
    box-shadow: .2em .2em .2em black;
 }

 .request {
    border: 3px solid #49a6e9;
    color: #49a6e9;
 }


.cancel {
    border: 3px solid brown;
    color: brown;
}
 .request:hover {
    color: white;
    background-color: #49a6e9;
 }

.cancel:hover {
    color: white;
    background-color: brown;
}
</style>