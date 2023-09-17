<script lang="ts">
  import Dots from "../Dots.svelte";
  import Dialog from "./Dialog.svelte";
  import { goto } from "$app/navigation";

  export let displayDeclineButton = false;


  function handleLeave() {
    goto("/")
  }
</script>

<Dialog id="waiting" class="waiting-dialog">
  <h1 id="waiting-msg" class="msg">
    Waiting on opponent<span class="dots"><Dots /></span>
  </h1>

  {#if displayDeclineButton}
    <div class="btn-container">
      <button class="leave btn" on:click={handleLeave}>Leave</button>
    </div>
  {/if}
</Dialog>

<style>
  :global(.waiting-dialog > form) {
    display: grid;
    grid-template-areas:
      "msg"
      "btns";
    justify-items: center;
  }

  .dots {
    padding: 0;
    position: relative;
    top: 0.4em;
  }

  .msg {
    grid-area: msg;
  }

  .btn-container {
    grid-area: btns;
    margin-bottom: 0.75rem;
  }

  .btn {
    font-size: 1rem;
    font-weight: 800;
    margin: 0.25em;
    padding: 0.5em 1em;
    cursor: pointer;
    background-color: white;
  }

  .btn:hover {
    box-shadow: 0.2em 0.2em 0.2em black;
  }

  .leave {
    text-decoration: none;
    border: 3px solid brown;
    color: brown;
  }

  .leave:hover {
    color: white;
    background-color: brown;
  }
</style>
