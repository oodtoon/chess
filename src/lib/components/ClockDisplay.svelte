<script lang="ts">
  import type Game from "$lib/models/game";
  import type { GameMinutes } from "$lib/type";
  import GameClock from "./GameClock.svelte";

  export let minutes: GameMinutes;
  export let game: Game;
  export let isMultiPlayer: boolean = false;
  export let roomSize: number = 1;

  let isWhitesTurn = true;

  $: activePlayer = game.getActivePlayer();

  $: if (activePlayer.color === "White") {
    isWhitesTurn = true;
  } else {
    isWhitesTurn = false;
  }
</script>

{#if minutes !== "Unlimited"}
  <div class="clock-display">
    <GameClock
      {minutes}
      isPaused={!isWhitesTurn}
      color={"white"}
      {isMultiPlayer}
      {roomSize}
    />
    <GameClock
      {minutes}
      isPaused={isWhitesTurn}
      color={"black"}
      {isMultiPlayer}
      {roomSize}
    />
  </div>
{/if}

<style>
  .clock-display {
    grid-area: time;
  }
</style>
