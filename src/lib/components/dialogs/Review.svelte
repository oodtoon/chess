<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import Dialog from "./Dialog.svelte";

  type $$Events = {
    close: CustomEvent<{ accepted: boolean }>;
  };

  export let title: string;
  export let content: string;

  const dispatch = createEventDispatcher();

  function close(accepted: boolean) {
    dispatch("close", { accepted });
  }
</script>

<Dialog id="review-dialog" class="review-dialog">
  <h2 class="title" id="review-title">{title}</h2>
  <div id="undo-review-msg" class="msg">
    {content}
  </div>
  <span class="btn-container">
    <button class="accept" on:click={() => close(true)}>Accept</button>
    <button class="decline" on:click={() => close(false)}>Decline</button>
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
