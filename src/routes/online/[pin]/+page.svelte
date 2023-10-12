<script lang="ts">
  import EventBus from "$lib/event-bus";
  import CapturePool from "$lib/components/CapturePool.svelte";
  import GameModel, { consumeToken } from "$lib/models/game";

  import GameButtons from "$lib/components/GameButtons.svelte";
  import MoveList from "$lib/components/MoveList.svelte";
  import { setGameContext } from "$lib/context";

  import { joinPrivateRoom } from "$lib/client";
  import { onMount, onDestroy } from "svelte";
  import type { BaseMove } from "$lib/models/move";
  import { derivePgnFromMoveStrings, parsePgn } from "$lib/io";
  import Game from "$lib/components/Game.svelte";
  import { getUndoTitle } from "$lib/controllers/utils/dialog-utils.js";
  import type { Color, GameMinutes, Response } from "$lib/type.js";
  import Waiting from "$lib/components/dialogs/Waiting.svelte";
  import Review from "$lib/components/dialogs/Review.svelte";
  import Undo from "$lib/components/dialogs/Undo.svelte";
  import GameClock from "$lib/components/GameClock.svelte";
  import { invalidateAll } from "$app/navigation";
  import PlayAgainButton from "$lib/components/PlayAgainButton.svelte";

  export let data;

  let roomSize = 0;
  let isUndoDialog = false;
  let minutes: GameMinutes = Infinity;
  const { room, team, pin } = data;

  let whiteClock: number = 0;
  let blackClock: number = 0;
  let ws: number;
  let bs: number;

  $: dialogState = $room
    ? $room?.state.requestState
    : { hasRequest: false, type: "", title: "", content: "", playerColor: "" };

  $: oldMovesLength =
    $room?.state.strMoves.length > 0 ? $room.state.strMoves.length : 0;

  const eventBus = new EventBus();

  const gameCtx = setGameContext(new GameModel(eventBus), "online");
  const { game } = gameCtx;

  let opponentColor: Color;

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
      $room = await joinPrivateRoom(pin);
    }

    $room.state.players.onAdd((player: any, sessionId: string) => {
      console.log("player:", sessionId, player.color, "has joined");

      if (sessionId === $room.sessionId) {
        $team = player.color;
        opponentColor = player.color === "White" ? "Black" : "White";
      }
      if ($room.state.strMoves.length > 0) {
        resetGameBoard([...$room.state.strMoves]);
      }

      roomSize = $room.state.players.size;

      if ($room.state.minutes !== 999999999) {
        minutes = $room.state.minutes;
        ws = $room.state.whiteClock;
        bs = $room.state.blackClock;
      } else {
        minutes = Infinity;
      }
    });

    $room.state.strMoves.onChange(() => {
      if (
        oldMovesLength > $room.state.strMoves.length &&
        $room.state.strMoves.length !== 0
      ) {
        game.update(($game) => {
          $game.undoMove();
          return $game;
        });
      } else {
        updateGameState([...$room.state.strMoves]);
      }
      oldMovesLength = $room.state.strMoves.length;
    });

    $room.onMessage("resign", (message: Response) => {
      const { result, reason } = message;
      $game.terminate({
        result,
        reason,
      });
      $game = $game;
    });

    $room.onMessage("response", (message: Response) => {
      if (message.type === "draw") {
        drawGame();
      }
    });

    $room.onMessage("timeUpdate", (message) => {
      ws = message.whiteClock;
      bs = message.blackClock;
    });
  }

  function handleMove(event: CustomEvent<{ move: BaseMove }>) {
    if ($team === event.detail.move.player.color) {
      const message = {
        move: event.detail.move.toString(),
        color: event.detail.move.player.color,
        whiteClock,
        blackClock,
      };
      $room.send("move", message);
    }
  }

  function updateGameState(strMoves: string[]) {
    const parsedPgn = createPgn(strMoves);
    const newMove = parsedPgn.moves.at(-1);
    if (newMove?.turn !== $team?.[0].toLowerCase()) {
      consumeToken(newMove!, $game);
    }
    $game = $game;
  }

  function resetGameBoard(strMoves: string[]) {
    const parsedPgn = createPgn(strMoves);
    $game.eventBus.muted = true;
    $game.fromParsedToken(parsedPgn);
    $game.eventBus.muted = false;
    $game = $game;
  }

  function createPgn(strMoves: string[]) {
    const pgn = derivePgnFromMoveStrings(strMoves);
    return parsePgn(pgn);
  }

  async function sendResponse(type: string, accepted: boolean) {
    if (accepted) {
      if (type === "undoMove") {
        $room.send("undoMove");
      } else if (type === "draw") {
        drawGame();
      }

      $room.send("response", {
        type,
      });

      $game = $game;
    } else {
      $room.send("response", {
        type: "close",
      });
    }
  }

  function drawGame() {
    $game.terminate({
      result: "1/2-1/2",
      reason: "draw agreed",
    });
    $game = $game;
  }

  function closeReviewDialog(event: CustomEvent) {
    const { accepted } = event.detail;
    sendResponse($room.state.requestState.type, accepted);
  }

  function closeUndoDialog(event: CustomEvent) {
    isUndoDialog = false;
    const { accepted, message } = event.detail;
    if (accepted) {
      $room.send("request", {
        type: "undoMove",
        title: getUndoTitle($team),
        content: message || "I made an oopsie",
      });
    }
  }

  $: $room?.state.requestState.onChange(async () => {
    dialogState = { ...$room.state.requestState };
  });

  function handleDraw() {
    let drawMsg;
    let player = $room.state.players.get($room.sessionId).color;
    const opposingPlayer = player === "White" ? "Black" : "White";
    drawMsg = `${player} wishes to draw. ${opposingPlayer}, do you accept?`;
    $room.send("request", { type: "draw", title: drawMsg });
  }

  function handleResign() {
    $room.send("resign", {
      type: "resign",
    });
  }

  async function handleUndo() {
    if ($game.getActivePlayer().color !== $team) {
      isUndoDialog = true;
    }
  }
</script>

<svelte:head>
  <title>Chess | Online</title>
</svelte:head>

<div class="container">
  <section class="board-container">
    <section class="player-info-container user">
      {#if $team}
        <CapturePool
          color={$team}
          capturedPieces={$game.blackPlayer.capturedPieces}
        />
        {#if minutes}
          <GameClock
            {minutes}
            seconds={ws}
            bind:time={whiteClock}
            {roomSize}
            color={$team}
          />
        {/if}
      {/if}
    </section>

    <Game on:move={handleMove} team={$team} isMultiPlayer={true} />

    <section class="player-info-container opponent">
      {#if $team}
        <CapturePool
          color={opponentColor}
          capturedPieces={$game.blackPlayer.capturedPieces}
        />
        {#if minutes}
        <GameClock
          {minutes}
          seconds={bs}
          bind:time={blackClock}
          {roomSize}
          color={opponentColor}
        />
      {/if}
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

  {#if roomSize !== 2}
    <Waiting displayDeclineButton={true} />
  {/if}

  {#if dialogState.hasRequest}
    {#if $team === dialogState.playerColor}
      <Waiting displayDeclineButton={false} />
    {:else}
      <Review
        title={dialogState.title}
        content={dialogState.content}
        on:close={closeReviewDialog}
      />
    {/if}
  {/if}

  {#if isUndoDialog}
    <Undo on:close={closeUndoDialog} />
  {/if}
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
    margin: 0 auto;
    max-width: 1400px;
    justify-items: center;
    gap: 2rem;
  }

  .board-container {
    grid-area: board;
    display: grid;
    grid-template-columns: auto;
    grid-template-areas: "opponent" "board" "user";
    width: calc(var(--responsive-size) * 8 + 10px);
    gap: 2rem;
  }

  .game-info-container {
    grid-area: info;
    background-color: rgba(255, 255, 255, 0.08);
  }

  .player-info-container {
    display: grid;
    grid-template-columns: 50px 5fr 3fr;
    grid-template-rows: 1fr 2fr;
    grid-template-areas: "icon name clock" "icon pieces clock";
    gap: 0px 1rem;
    border-radius: 2rem;
  }

  .user {
    grid-area: user;
  }

  .opponent {
    grid-area: opponent;
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

  @media (min-width: 1000px) {
    :root {
      --responsive-size: 4.6rem;
    }

    .container {
      margin: auto 1em;
      grid-template-columns: 1fr 1fr;
      grid-template-areas: "board info";
    }

    .board-container {
      display: grid;
      grid-template-columns: auto;
      grid-template-rows: 50px auto 50px;
      grid-template-areas: "opponent" "board" "user";
      gap: 2rem;
    }

    .game-info-container {
      margin: 5em auto;
    }
  }
</style>
