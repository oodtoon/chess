<script>
  import { createEventDispatcher } from "svelte";
  import { fade } from "svelte/transition";
  import ErrorIcon from "../icons/ErrorIcon.svelte";
  import CloseToastIcon from "../icons/CloseToastIcon.svelte";

  const dispatch = createEventDispatcher();

</script>

<article class="error" role="alert" transition:fade>

    <ErrorIcon width="1.1em" />

  <div class="text">
    Invalid PGN format.
  </div>

  <button class="close" on:click={() => dispatch("dismiss")}>
      <CloseToastIcon width="0.8em" />
  </button>

</article>

<style>
  article {
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 0.2rem;
    display: flex;
    align-items: center;
    margin: 0 auto 0.5rem auto;
  }
  .error {
    background: IndianRed;
  }

  .text {
    margin: 0 2em;
  }
  button {
    color: white;
    background: transparent;
    border: 0 none;
    padding: 0;
    margin: 0 0 0 auto;
    line-height: 1;
    font-size: 1rem;
  }
</style>