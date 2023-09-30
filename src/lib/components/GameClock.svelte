<script lang="ts">
  import type Game from "$lib/models/game";
  import { getGameContext } from "$lib/context";

  export let minutes: number;
  export let isPaused: boolean;
  export let color: string;
  export let isMultiPlayer: boolean;
  export let roomSize: number;

  $: if (isMultiPlayer && roomSize < 2) {
    isPaused = true;
  } else if (isMultiPlayer && roomSize === 2 && color === "white") {
    isPaused = false;
  }

  const gameCtx = getGameContext();
  const { game } = gameCtx;

  $: gameTime = minutes * 60;

  let countDownInt: NodeJS.Timer;

  const formatMinute = (t: string) => Math.floor(parseInt(t) / 60).toString();

  const formatSecond = (t: string) =>
    (parseInt(t) % 60).toString().padStart(2, "0");

  const formatMili = (t: string) => t.toString().padStart(2, "0").padEnd(2);

  function countDown() {
    gameTime = gameTime - 0.1;
  }

  $: if (!isPaused) {
    countDownInt = setInterval(countDown, 100);
  } else {
    clearInterval(countDownInt);
  }

  $: if (gameTime <= 0) {
    clearInterval(countDownInt);
    $game.terminate({
      result: $game.getActivePlayer().isWhite ? "0-1" : "1-0",
      reason: "time out",
    });
    $game = $game;
  }
</script>

<span
  class="time"
  class:white={!isPaused && color === "white"}
  class:black={!isPaused && color === "black"}
>
  {#if color === "white"}
    <span>White </span>
  {:else}
    <span class="vs">vs. </span>
    <span>Black </span>
  {/if}

  <span>{formatMinute(gameTime.toFixed(0))} :</span>

  {#if gameTime <= 59 && gameTime > 0}
    <span>{formatMili(gameTime.toFixed(1))}</span>
  {:else}
    <span>{formatSecond(gameTime.toFixed(0))}</span>
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
