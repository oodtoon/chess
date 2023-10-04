<script lang="ts">
  import { getGameContext } from "$lib/context";

  export let seconds: number;
  export let time: number;
  // export let isPaused: boolean;
  export let color: string;
  export let isMultiPlayer: boolean = false;
  export let roomSize: number;

  let isPaused: boolean;

  $: if (seconds) {
    time = seconds;
  }

  $: activePlayer = $game.getActivePlayer();

  $: if (isMultiPlayer && roomSize < 2) {
    isPaused = true;
  } else if (color === activePlayer.color) {
    isPaused = false;
  } else {
    isPaused = true;
  }

  let clockInt: NodeJS.Timeout;

  const gameCtx = getGameContext();
  const { game } = gameCtx;

  function countDown() {
    time -= 0.1;
  }

  const formatMinute = (t: string) => Math.floor(parseInt(t) / 60).toString();

  const formatSecond = (t: string) =>
    (parseInt(t) % 60).toString().padStart(2, "0");

  const formatMili = (t: string) => t.toString().padStart(2, "0").padEnd(2);

  $: if (!isPaused) {
    clockInt = setInterval(countDown, 100);
  } else {
    clearInterval(clockInt);
  }

  $: if (time <= 0) {
    $game.terminate({
      result: $game.getActivePlayer().isWhite ? "0-1" : "1-0",
      reason: "time out",
    });
    $game = $game;
  }
</script>

<span
  class="time"
  class:white={!isPaused && color === "White"}
  class:black={!isPaused && color === "Black"}
>
  {#if color === "White"}
    <span>White </span>
  {:else}
    <span class="vs">vs. </span>
    <span>Black </span>
  {/if}

  {#if time}
    <span>{formatMinute(time.toFixed(0))} :</span>

    {#if time <= 59 && time > 0}
      <span>{formatMili(time.toFixed(1))}</span>
    {:else}
      <span>{formatSecond(time.toFixed(0))}</span>
    {/if}
  {/if}
</span>

<style>
  .time {
    color: white;
  }
  .white {
    background-color: green;
    color: brown;
  }

  .black {
    background-color: green;
    color: #49a6e9;
  }

  .vs {
    background-color: rgb(32, 32, 32);
    color: white;
  }
</style>
