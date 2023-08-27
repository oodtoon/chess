<script lang="ts">
  import Dialog from "$lib/components/dialogs/Dialog.svelte";

  let inputRef: HTMLInputElement;

</script>

<Dialog id="join-room">
  <h1>Enter Room Id</h1>
  <input type="text" bind:this={inputRef} />
  <button class="join btn" type="button">Join Room</button
  >
  <a href="/" class="back btn">Back</a>
</Dialog>

<style>
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

  .join {
    border: 3px solid #49a6e9;
    color: #49a6e9;
  }

  .back {
    text-decoration: none;
    border: 3px solid brown;
    color: brown;
  }

  .join:hover {
    color: white;
    background-color: #49a6e9;
  }

  .back:hover {
    color: white;
    background-color: brown;
  }
</style>
