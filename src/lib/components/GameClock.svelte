<script lang="ts">
  import { getGameContext } from "$lib/context";
  import type Game from "$lib/models/game";
  import type { Color } from "$lib/type";
  import ClockIcon from "./icons/ClockIcon.svelte";
  import minuteWarningAudioSrc from "$lib/audio/minute.mp3";
  import tenSecondAudioSrc from "$lib/audio/10second.mp3";
  import clockAudioSrc from "$lib/audio/clock.mp3";

  export let minutes: number;
  export let seconds: number;
  export let color: Color;
  export let isMultiPlayer: boolean = false;
  export let roomSize: number;
  export let client: Color;
  export let isMuted: boolean = false;

  let time: number;
  let isPaused: boolean = true;

  let minuteSound = new Audio(minuteWarningAudioSrc);
  let tenSecondSound = new Audio(tenSecondAudioSrc);
  let clockSound = new Audio(clockAudioSrc);

  $: if (minutes === Infinity) {
    isPaused = true;
  }

  // const counter = initStore()

  // $: $counter.bannas === 5 && alert("hello")
  // counter.incBanna()

  $: if (seconds !== Infinity) {
    time = seconds;
  }

  const gameCtx = getGameContext();
  const { game } = gameCtx;

  $: activePlayer = $game.getActivePlayer();

  $: if ($game.result !== null) {
    isPaused = true;
  }

  $: if (isMultiPlayer && roomSize < 2) {
    isPaused = true;
  } else if (color === activePlayer.color && !$game.isGameOver) {
    isPaused = false;
  } else {
    isPaused = true;
  }

  let clockInt: NodeJS.Timeout;

  function getTurnText(game: Game) {
    return game.resultText ?? `${game.getActivePlayer().color}'s Turn`;
  }

  function countDown() {
    time -= 0.1;
  }

  const formatMinute = (t: string) => Math.floor(parseInt(t) / 60).toString();

  const formatSecond = (t: string) =>
    (parseInt(t) % 60).toString().padStart(2, "0");

  const formatMili = (t: string) => t.toString().padStart(4, "0");

  function isActivePlayer() {
    if (isMultiPlayer) {
      return client === color && activePlayer.color === color;
    } else {
      return activePlayer.color === color;
    }
  }

  function shouldPlaySound() {
    return !isMuted && isActivePlayer();
  }

  $: if (!isPaused) {
    clockInt = setInterval(countDown, 100);
  } else {
    clearInterval(clockInt);
  }

  $: if (time <= 0 && minutes !== Infinity) {
    if (isMultiPlayer && roomSize === 1) {
      $game.terminate({
        result: $game.getActivePlayer().isWhite ? "1-0" : "0-1",
        reason: "opponent disconnected",
      });
    }
    $game.terminate({
      result: $game.getActivePlayer().isWhite ? "0-1" : "1-0",
      reason: "time out",
    });
    $game = $game;
  }

  $: if (time <= 0) {
    clearInterval(clockInt);
  }

  $: if (shouldPlaySound()) {
    if (time <= 60.5 && time >= 59) {
      minuteSound.play();
    } else if (time <= 10.5 && time >= 9.9) {
      tenSecondSound.play();
    } else if (time < 10 && time > 0 && !$game.isGameOver) {
      clockSound.play();
    }
  }

  $: if (!shouldPlaySound() || time <= 0) {
    clockSound.pause();
  }
</script>

{#if minutes !== Infinity}
  <span
    class="clock-container"
    class:White={color === "White"}
    class:Black={color === "Black"}
    class:minuteWarning={time <= 60 && time > 57}
    class:tenSecondWarning={time < 10}
  >
    <span class="clock-icon">
      <ClockIcon {color} />
    </span>
    {#if time !== undefined}
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

  .minuteWarning {
    background-color: rgba(241, 213, 155, 255);
  }

  .tenSecondWarning {
    background-color: red;
  }
</style>
