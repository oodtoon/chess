<script lang="ts">
  import type GameModel from "$lib/models/game";
  import { createEventDispatcher } from "svelte";
  import Dialog from "./Dialog.svelte";

  type $$Events = {
    close: CustomEvent<{accepted: boolean}>
  }

  export let game: GameModel;

  function handleAccept() {
    const reviewTitle = document.getElementById("review-title")!.textContent;
    if (reviewTitle!.includes("draw")) {
      const msg = "Draw";
      
    } 
  }

  const dispatch = createEventDispatcher()

  function close(accepted: boolean) {
    dispatch("close", {accepted})
  }
</script>

<Dialog id="review-dialog" class="review-dialog">
    <h2 class="title" id="review-title">Want to review?</h2>
    <div id="undo-review-msg" class="msg" />
    <span class="btn-container">
      <button
        class="accept"
        type="button"
        on:click={() => close(true)}>Accept</button
      >
      <!-- svelte-ignore missing-declaration -->
      <button
        class="decline"
        type="button"
        on:click={() => close(false)}>Decline</button
      >
    </span>
</Dialog>

<style>
  :global(.review-dialog > form) {
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
