<script lang="ts">
  import EventBus from "$lib/event-bus";
  import CapturePool from "$lib/components/CapturePool.svelte";
  import Game from "$lib/components/Game.svelte";
  import GameModel from "$lib/models/game";

  import GameButtons from "$lib/components/GameButtons.svelte";
  import MoveList from "$lib/components/MoveList.svelte";
  import { setGameContext } from "$lib/context";

  import { onMount } from "svelte";
  import type { BaseMove } from "$lib/models/move.js";

  import { consumeToken } from "$lib/models/game";

  import { derivePgnFromMoveStrings, parsePgn } from "$lib/io.js";
  import { joinPrivateRoom } from "$lib/client.js";
  import GameClock from "$lib/components/GameClock.svelte";
  import type { GameMinutes } from "$lib/type.js";

  export let data;
  let roomSize: number = 0;
  let minutes: GameMinutes = Infinity;
  let ws: number;
  let bs: number;
  let oldMovesLength: number;
  const { room, team, pin } = data;

  const eventBus = new EventBus();
  const gameContext = setGameContext(new GameModel(eventBus), "local");
  const { game } = gameContext;

  let whiteClock: number;
  let blackClock: number;

  function getTurnText(game: GameModel) {
    return game.resultText ?? `${game.getActivePlayer().color}'s Turn`;
  }

  onMount(() => {
    setupRoom();
  });

  async function setupRoom() {
    if (!$room) {
      $room = await joinPrivateRoom(pin!);
    }

    $room.state.players.onAdd((player: any, sessionId: string) => {
      console.log("player:", sessionId, player.color, "has joined");

      if ($room.state.minutes !== Infinity) {
        minutes = $room.state.minutes;
        ws = $room.state.whiteClock;
        bs = $room.state.blackClock;
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

    roomSize = $room.state.players.size;
  }

  function handleMove(event: CustomEvent<{ move: BaseMove }>) {
    const message = {
      move: event.detail.move.toString(),
      color: "Both",
      moveTime: Math.round(Date.now() / 1000),
      whiteClock,
      blackClock,
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
    const parsedPgn = createPgn(strMoves);
    $game.eventBus.muted = true;
    parsedPgn.moves.forEach((move) => {
      consumeToken(move, $game);
    });
    $game.eventBus.muted = false;
    $game = $game;
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
</script>

<svelte:head>
  <title>Chess | Local</title>
</svelte:head>

<div class="container">
  <h2 class="turn" id="turn">{getTurnText($game)}</h2>

  <section class="capture-container">
    <CapturePool
      color="White"
      capturedPieces={$game.blackPlayer.capturedPieces}
    />
    <CapturePool
      color="Black"
      capturedPieces={$game.whitePlayer.capturedPieces}
    />
  </section>

  <Game on:move={handleMove} />
  <MoveList />
  <GameButtons
    on:draw={handleDraw}
    on:undo={handleUndo}
    on:resign={handleResign}
  />

  {#if minutes && minutes !== Infinity}
    <div class="clock-display">
      <GameClock
        seconds={ws}
        bind:time={whiteClock}
        {roomSize}
        color={"White"}
      />
      <GameClock
        seconds={bs}
        bind:time={blackClock}
        {roomSize}
        color={"Black"}
      />
    </div>
  {/if}
</div>

<style>
  :root {
    --responsive-size: 5rem;
    --min-size: 3rem;
    --captured-piece-size: 3rem;
    --element-size: 1rem;
  }

  * {
    user-select: none;
  }

  .container {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: auto;
    grid-template-areas: "turn" "board" "btns" "moves-list" "time";
    margin: auto;
    max-width: 1400px;
    justify-items: center;
  }

  .capture-container {
    display: flex;
    margin: auto;
    justify-content: space-evenly;
    gap: 1em;
    width: 100%;
  }

  .turn {
    color: #49a6e9;
    grid-area: turn;
    place-self: center;
  }

  .clock-display {
    grid-area: time;
  }
  @media (min-width: 700px) {
    :root {
      --responsive-size: 4rem;
    }

    .container {
      gap: 1em;
      margin: auto;
      margin-top: 2em;
      grid-template-columns: 1fr 2fr;
      grid-template-areas:
        "turn board"
        "captured-black board"
        "captured-white board"
        "btns board"
        ". moves-list"
        "time time";
    }

    .capture-container {
      display: block;
      width: 100%;
    }

    .turn {
      margin: auto;
      place-self: center;
    }
  }

  @media (min-width: 1000px) {
    :root {
      --responsive-size: 5rem;
    }

    .container {
      margin: auto 1em;
      grid-template-columns: 1fr 3fr 1fr;
      grid-template-areas:
        " turn board moves-list"
        "captured-black board moves-list"
        "btns board ."
        ". board  ."
        ". time .";
    }

    .capture-container {
      display: block;
      margin: 0;
    }
  }
</style>
