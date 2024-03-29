<script lang="ts">
  import EventBus from "$lib/event-bus";
  import CapturePool from "$lib/components/CapturePool.svelte";
  import Game from "$lib/components/Game.svelte";
  import GameModel from "$lib/models/game";

  import GameButtons from "$lib/components/GameButtons.svelte";
  import MoveList from "$lib/components/MoveList.svelte";
  import { setGameContext } from "$lib/context";

  import { onDestroy, onMount } from "svelte";
  import type { BaseMove } from "$lib/models/move.js";

  import { consumeToken } from "$lib/models/game";

  import { derivePgnFromMoveStrings, parsePgn } from "$lib/io.js";
  import { joinPrivateRoom } from "$lib/client.js";
  import GameClock from "$lib/components/GameClock.svelte";
  import type { GameMinutes } from "$lib/type.js";
  import { invalidateAll } from "$app/navigation";
  import PlayAgainButton from "$lib/components/PlayAgainButton.svelte";
  import winAudioSrc from "$lib/audio/win.mp3";
  import lossAudioSrc from "$lib/audio/loss.mp3";
  import AudioToggle from "$lib/components/AudioToggle.svelte";
  import End from "$lib/components/dialogs/End.svelte";

  export let data;
  let roomSize: number = 0;
  let minutes: GameMinutes = Infinity;
  let whiteClock: number = Infinity;
  let blackClock: number = Infinity;
  let oldMovesLength: number;
  let isMuted = false;
  let hasUserClosedEngDialog = false

  const COLYSEUS_INFINITY = 999999999

  const { room, team, pin } = data;

  const eventBus = new EventBus();
  const gameCtx = setGameContext(new GameModel(eventBus), "local");
  const { game } = gameCtx;

  let winSound = new Audio(winAudioSrc);
  let lossSound = new Audio(lossAudioSrc);

  onMount(() => {
    invalidateAll();
    setupRoom();
  });

  onDestroy(() => {
    $room.leave(false);
  });

  async function setupRoom() {
    if (!$room) {
      $room = await joinPrivateRoom(pin!);
    }

    $room.state.players.onAdd((player: any, sessionId: string) => {
      console.log("player:", sessionId, player.color, "has joined");

      if ($room.state.minutes !== COLYSEUS_INFINITY) {
        minutes = $room.state.minutes;
        whiteClock = $room.state.whiteClock <= 0 ? 0 : $room.state.whiteClock;
        blackClock = $room.state.blackClock <= 0 ? 0 : $room.state.blackClock;
      } else {
        minutes = Infinity;
      }

      if ($room.state.strMoves.length > 0) {
        resetGameBoard([...$room.state.strMoves]);
      }

      if ($room.state.result) {
        $game.result = $room.state.result;
        $game.terminationReason = $room.state.terminationReason;
      }
    });

    $room.state.strMoves.onChange(() => {
      if ($room.state.strMoves.length === 0) {
        gameCtx.reset();
        $game = $game;
      } else if ($room.state.strMoves > oldMovesLength) {
        updateGameState([...$room.state.strMoves]);
      }
      oldMovesLength = $room.state.strMoves.length;
    });

    $room.onMessage("timeUpdate", (message) => {
      whiteClock = message.whiteClock;
      blackClock = message.blackClock;
    });

    roomSize = $room.state.players.size;
  }

  function handleMove(event: CustomEvent<{ move: BaseMove }>) {
    const isGameOver = $game.isGameOver;
    let gameOverMessage = {};
    if (isGameOver) {
      gameOverMessage = {};
    }
    const message = {
      move: event.detail.move.toString(),
      color: "Both",
      isGameOver,
      ...gameOverMessage,
    };
    $room.send("move", message);
  }

  function updateGameState(strMoves: string[]) {
    const parsedPgn = createPgn(strMoves);
    const newMove = parsedPgn.moves.at(-1);
    const color = newMove?.turn === "w" ? "White" : "Black";
    if (color !== $team) {
      consumeToken(newMove!, $game);
    }
    $game = $game;
  }

  function resetGameBoard(strMoves: string[]) {
    $game.eventBus.muted = true;
    const parsedPgn = createPgn(strMoves);
    $game.eventBus.muted = true;
    parsedPgn.moves.forEach((move) => {
      consumeToken(move, $game);
    });
    $game.eventBus.muted = false;
    $game = $game;
    $game.eventBus.muted = false;
  }

  function createPgn(strMoves: string[]) {
    const pgn = derivePgnFromMoveStrings(strMoves);
    return parsePgn(pgn);
  }

  function handleDraw() {

    $game.terminate({
      result: "1/2-1/2",
      reason: "draw agreed",
    });
    $room.send("draw");
    $game = $game;
  }

  function handleResign() {

    const result = $game.getActivePlayer().isWhite ? "0-1" : "1-0";
    $game.terminate({
      result,
      reason: "resignation",
    });
    $room.send("resign", { result });
    $game = $game;
  }

  function handleUndo() {

    game.update(($game) => {
      $game.undoMove();
      return $game;
    });
  }

  function handleReset() {
    $room.send("reset");
  }

  function handleEndGameClose() {
    hasUserClosedEngDialog = true;
  }

  function handlePlayAgain() {
    gameCtx.reset()
  }

  $: activePlayer = $game.getActivePlayer();

  $: if ($game.result && $game.result !== "1/2-1/2" && !isMuted) {
    winSound.play();
  } else if ($game.result === "1/2-1/2" && !isMuted) {
    lossSound.play();
  }
</script>

<svelte:head>
  <title>Chess | Local</title>
</svelte:head>

<div class="container">
  <section class="board-container">
    <section
      class="player-info-container"
      class:active-player={activePlayer.color === "White"}
      class:non-active-player={activePlayer.color !== "White"}
    >
      <CapturePool player={$game.whitePlayer} />
      {#if minutes}
        <GameClock
          {minutes}
          seconds={whiteClock}
          {roomSize}
          color={"White"}
          client={activePlayer.color}
          {isMuted}
        />
      {/if}
    </section>

    <Game on:move={handleMove} on:playAgain={handleReset} {isMuted} />

    <section
      class="player-info-container"
      class:active-player={activePlayer.opponent.color !== "Black"}
      class:non-active-player={activePlayer.opponent.color === "Black"}
    >
      <CapturePool player={$game.blackPlayer} />
      {#if minutes}
        <GameClock
          {minutes}
          seconds={blackClock}
          {roomSize}
          color={"Black"}
          client={activePlayer.color}
          {isMuted}
        />
      {/if}
    </section>
  </section>

  <section class="game-info-container">
    <GameButtons
      on:draw={handleDraw}
      on:undo={handleUndo}
      on:resign={handleResign}
    />
    {#if minutes}
      <MoveList {minutes} on:playAgain={handleReset} />
    {/if}
    <AudioToggle bind:isMuted />
  </section>
</div>

{#if $game.result && !hasUserClosedEngDialog}
<End on:close={handleEndGameClose} on:playAgain={handlePlayAgain} />
{/if}

<style>
  :root {
    --responsive-size: 4rem;
    --min-size: 3rem;
    --captured-piece-size: 3rem;
    --element-size: 1rem;
  }

  * {
    user-select: none;
  }

  .container {
    display: grid;
    grid-template-columns: auto;
    grid-template-rows: auto;
    grid-template-areas: "board" "info";
    margin: auto;
    max-width: 1400px;
    justify-items: center;
    gap: 2rem;
  }

  .board-container {
    grid-area: board;
    display: grid;
    grid-template-columns: auto;
    grid-template-areas: "non-active" "board" "active";
    width: calc(var(--responsive-size) * 8 + 10px);
    gap: 2rem;
  }

  .game-info-container {
    grid-area: info;
    background-color: rgba(255, 255, 255, 0.08);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
  }

  .player-info-container {
    display: grid;
    grid-template-columns: 50px 5fr 3fr;
    grid-template-rows: 1fr 2fr;
    grid-template-areas: "icon name clock" "icon pieces clock";
    align-items: center;
    gap: 0px 1rem;
  }

  .active-player {
    grid-area: active;
  }

  .non-active-player {
    grid-area: non-active;
  }

  @media (min-width: 700px) {
    :root {
      --responsive-size: 4rem;
    }

    .container {
      gap: 1em;
      margin: auto;
      place-self: center;
      grid-template-areas:
        "board"
        "info";
    }
  }

  @media (min-width: 1000px) and (max-height: 900px) {
    :root {
      --responsive-size: 5.5rem;
    }

    .player-info-container {
      display: grid;
      grid-template-columns: auto;
      grid-template-rows: 3fr 2fr 1fr;
      grid-template-areas: "clock clock clock" "icon name name" "pieces pieces pieces";
      background-color: rgba(255, 255, 255, 0.08);
      padding: 1em;
      min-width: 160px;
      max-height: 200px;
      justify-items: stretch;
    }

    .container {
      margin: 1em 1em;
      grid-template-columns: 2fr 1fr;
      grid-template-areas: "board info";
    }

    .board-container {
      display: grid;
      grid-template-rows: 1fr 1fr;
      grid-template-columns: 1fr 2fr;
      grid-template-areas: "non-active board" "active board";
      width: fit-content;
      height: fit-content;
      gap: 0 1em;
    }

    .active-player {
      place-self: start;
      padding-bottom: 3em;
    }

    .non-active-player {
      place-self: end;
      padding-top: 5em;
    }

    .game-info-container {
      place-self: start;
    }
  }

  @media (min-width: 1000px) and (min-height: 900px) {
    :root {
      --responsive-size: 5.5rem;
    }

    .container {
      margin: 2em auto;
      grid-template-columns: 2fr 1fr;
      grid-template-areas: "board info";
      height: fit-content;
    }
    .board-container {
      display: grid;
      grid-template-areas: "non-active" "board" "active";
      width: fit-content;
      height: fit-content;
      gap: 1em;
    }

    .game-info-container {
      margin: auto;
    }

    .player-info-container {
      grid-template-rows: 1fr 1fr;
      grid-template-areas: "icon name clock" "icon pieces clock";
    }

    .active-player {
      margin-top: 1em;
    }
  }
</style>
