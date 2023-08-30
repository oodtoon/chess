<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import Dialog from "./Dialog.svelte";

  interface $$Events {
    close: CustomEvent<{
      accepted: boolean;
      message: string;
    }>;
  }

  const dispatch = createEventDispatcher();
  let textareaRef: HTMLTextAreaElement;

  function handleAccept() {
    close(true, textareaRef.value);
  }

  function handleDecline() {
    close(false, "");
  }

  function close(accepted: boolean, message: string) {
    dispatch("close", {
      accepted,
      message,
    });
  }
</script>

<Dialog id="undo-dialog">
  <h2 class="title" id="undo-title">
    Send undo move request to opponent for approval.
  </h2>
  <section class="input">
    <label
      ><span class="label">Message to opponent:</span>
      <textarea bind:this={textareaRef} />
    </label>
  </section>

  <span class="btn-container">
    <button class="request" type="button" on:click={handleAccept}
      >Send Undo Request</button
    >
    <button
      class="cancel"
      formmethod="dialog"
      type="button"
      on:click={handleDecline}>Cancel</button
    >
  </span>
</Dialog>

<style>
  :global(#undo-dialog > form) {
    display: grid;
    grid-template-areas:
      "title"
      "input"
      "btn";
    background-color: white;
  }

  textarea {
    border-radius: 4px;
    border: 1px solid black;
  }
  .title {
    grid-area: title;
    place-self: center;
  }

  .input {
    grid-area: input;
    align-self: start;
    justify-self: center;
  }

  .label {
    position: relative;
    top: -1.5em;
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
