<script lang="ts">
  import { getGameContext } from "$lib/context";
  import type Game from "$lib/models/game";
  import type { Color } from "$lib/type";
  import ClockIcon from "./icons/ClockIcon.svelte";

  export let minutes: number;
  export let seconds: number;
  export let color: string;
  export let isMultiPlayer: boolean = false;
  export let roomSize: number;
  export let client: Color

  let time: number
  let isPaused: boolean = true

  $: if (minutes === Infinity) {
    isPaused = true
  }

  $: if (seconds && seconds !== Infinity) {
    time = seconds;
  }

  $: activePlayer = $game.getActivePlayer();

  $: if (isMultiPlayer && roomSize < 2) {
    isPaused = true;
  } else if (color === activePlayer.color && !$game.isGameOver) {
    isPaused = false;
  } else {
    isPaused = true;
  }

  let clockInt: NodeJS.Timeout;

  const gameCtx = getGameContext();
  const { game } = gameCtx;

  function getTurnText(game: Game) {
    return game.resultText ?? `${game.getActivePlayer().color}'s Turn`;
  }

  function countDown() {
    time -= 0.1;
  }

  const formatMinute = (t: string) => Math.floor(parseInt(t) / 60).toString();

  const formatSecond = (t: string) =>
    (parseInt(t) % 60).toString().padStart(2, "0");

  const formatMili = (t: string) => t.toString().padStart(2, "0");

  $: if (!isPaused) {
    clockInt = setInterval(countDown, 100);
  } else {
    clearInterval(clockInt);
  }

  $: if (time <= 0 && minutes !== Infinity) {
    $game.terminate({
      result: $game.getActivePlayer().isWhite ? "0-1" : "1-0",
      reason: "time out",
    });
    $game = $game;
  }

  $: if (time <= 0) {
    clearInterval(clockInt);
  }
</script>

{#if minutes !== Infinity}
  <span
    class="clock-container"
    class:White={color === "White"}
    class:Black={color === "Black"}
  >
    <span class="clock-icon">
      <ClockIcon {color} />
    </span>
    {#if time}
      <span>{formatMinute(time.toFixed(0))}:</span>
      {#if time <= 59 && time > 0}
        <span>{formatMili(time.toFixed(1))}</span>
      {:else}
        <span>{formatSecond(time.toFixed(0))}</span>
      {/if}
    {/if}
  </span>
{:else if minutes === Infinity && client !== color}
  <span
    class="clock-container"
    class:White={$game.getActivePlayer().color === "White"}
    class:Black={$game.getActivePlayer().color === "Black"}
  >
    {getTurnText($game)}
  </span>
{/if}

<style>
  .clock-container {
    grid-area: clock;
    align-self: center;
    display: flex;
    border-radius: 8px;
    margin: 0;
    color: black;
    font-weight: 800;
    align-items: center;
    justify-content: space-between;
    font-size: 1.5rem;
    padding: 0 1rem;
  }

  .clock-icon {
    margin: auto;
  }

  .White {
    background-color: white;
    color: black;
    border: solid 3px black;
  }

  .Black {
    background-color: black;
    color: white;
    border: solid 3px white;
  }
</style>
