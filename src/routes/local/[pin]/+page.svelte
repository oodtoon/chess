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

  export let data;
  let roomSize: number = 0;
  let minutes: GameMinutes = Infinity;
  let ws: number = Infinity;
  let bs: number = Infinity;
  let oldMovesLength: number;
  const { room, team, pin } = data;

  const eventBus = new EventBus();
  const gameContext = setGameContext(new GameModel(eventBus), "local");
  const { game } = gameContext;

  onMount(() => {
    invalidateAll();
    setupRoom();
  });

  onDestroy(() => {
    console.log("leaving");
    $room.leave(false);
  });

  async function setupRoom() {
    if (!$room) {
      $room = await joinPrivateRoom(pin!);
    }

    $room.state.players.onAdd((player: any, sessionId: string) => {
      console.log("player:", sessionId, player.color, "has joined");

      if ($room.state.minutes !== 999999999) {
        minutes = $room.state.minutes;
        ws = $room.state.whiteClock;
        bs = $room.state.blackClock;
      } else {
        minutes = Infinity;
      }

      if ($room.state.strMoves.length > 0) {
        resetGameBoard([...$room.state.strMoves]);
      }
    });

    $room.state.strMoves.onChange(() => {
      if ($room.state.strMoves > oldMovesLength) {
        updateGameState([...$room.state.strMoves]);
      }

      oldMovesLength = $room.state.strMoves.length;
    });

    $room.onMessage("timeUpdate", (message) => {
      ws = message.whiteClock;
      bs = message.blackClock;
    });

    roomSize = $room.state.players.size;
  }

  function handleMove(event: CustomEvent<{ move: BaseMove }>) {
    const message = {
      move: event.detail.move.toString(),
      color: "Both",
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

    $game = $game;
  }

  function handleResign() {
    $game.terminate({
      result: $game.getActivePlayer().isWhite ? "0-1" : "1-0",
      reason: "resignation",
    });

    $game = $game;
  }

  function handleUndo() {
    game.update(($game) => {
      $game.undoMove();
      return $game;
    });
  }

  $: activePlayer = $game.getActivePlayer()
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
          seconds={ws}
          {roomSize}
          color={"White"}
          client={activePlayer.color}
        />
      {/if}
    </section>

    <Game on:move={handleMove} />

    <section
      class="player-info-container"
      class:active-player={activePlayer.opponent.color !== "Black"}
      class:non-active-player={activePlayer.opponent.color === "Black"}
    >
      <CapturePool player={$game.blackPlayer}/>
      {#if minutes}
        <GameClock
          {minutes}
          seconds={bs}
          {roomSize}
          color={"Black"}
          client={activePlayer.color}
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
      <MoveList {minutes} />
    {/if}

    {#if $game.result}
      <PlayAgainButton />
    {/if}
  </section>
</div>

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

  @media (min-width: 1000px) and (max-height: 800px) {
    :root {
      --responsive-size: 5.5rem;
    }

    .player-info-container {
      display: grid;
      grid-template-areas: "clock clock clock" "icon name ." "icon pieces pieces";
      background-color: rgba(255, 255, 255, 0.08);
      padding: 1em;
      min-width: 160px;
      max-height: 200px;
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

  @media (min-width: 1000px) and (min-height: 800px) {
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
