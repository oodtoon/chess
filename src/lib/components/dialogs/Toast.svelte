<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { fade } from "svelte/transition";
  import ErrorIcon from "../icons/ErrorIcon.svelte";
  import CloseToastIcon from "../icons/CloseToastIcon.svelte";
  import WarningIcon from "../icons/WarningIcon.svelte";
  import SuccessIcon from "../icons/SuccessIcon.svelte";
  import { getGameContext } from "$lib/context";

  const dispatch = createEventDispatcher();
  const gameCtx = getGameContext();
  const { game } = gameCtx;

  export let type: string;

  let seconds = 20;
  let int: NodeJS.Timer;

  function countDown() {
    seconds -= 1;
  }

  $: if (type === "disconnect" && !$game.result) {
    int = setInterval(countDown, 1000);
  }

  $: if (seconds <= 0) {
    clearInterval(int);
  }
</script>

<article
  class:error={type === "importError"}
  class:disconnect={type === "disconnect"}
  class:reconnect={type === "reconnect"}
  role="alert"
  transition:fade
>
  {#if type === "importError"}
    <ErrorIcon width="1.1em" />
  {:else if type === "disconnect"}
    <WarningIcon />
  {:else}
    <SuccessIcon />
  {/if}

  <div class="text">
    {#if type === "importError"}
      Invalid PGN format.
    {:else if type === "disconnect"}
      Opponent disconnected {#if !$game.result}
        0:{seconds.toString().padStart(2, "0")}
      {/if}
    {:else}
      Opponent is back!
    {/if}
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

  .disconnect {
    background: orange;
  }

  .reconnect {
    background: rgb(9, 193, 9);
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
