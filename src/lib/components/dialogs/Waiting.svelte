<script lang="ts">
  import Dots from "../Dots.svelte";
  import Dialog from "./Dialog.svelte";
</script>

<Dialog id="welcome" class="welcome-dialog">
  <h1 id="welcome-msg" class="msg">
    Waiting on opponent<span class="dots"><Dots /></span>
  </h1>

  <div class="btn-container">
    <a class="decline btn" href="/">Leave</a>
  </div>
</Dialog>

<style>
  :global(.welcome-dialog > form) {
    display: grid;
    grid-template-areas:
      "msg"
      "btns";
    justify-items: center;
  }

  .dots {
    padding: 0;
    position: relative;
    top: .4em;
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

  .decline {
    text-decoration: none;
    border: 3px solid brown;
    color: brown;
  }

  .decline:hover {
    color: white;
    background-color: brown;
  }


</style>
