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
  import winAudioSrc from "$lib/audio/win.mp3";
  import lossAudioSrc from "$lib/audio/loss.mp3";
  import AudioToggle from "$lib/components/AudioToggle.svelte";
  import Toast from "$lib/components/dialogs/Toast.svelte";

  export let data;

  let roomSize = 0;
  let hasOpponentLeft = false;
  let isReconnect = false;
  let playerAwayInt: NodeJS.Timeout;
  let isUndoDialog = false;
  let minutes: GameMinutes = Infinity;
  const { room, team, pin } = data;

  let ws: number = Infinity;
  let bs: number = Infinity;

  let isMuted: boolean = false;
  let isReset = false;

  $: dialogState = $room
    ? $room?.state.requestState
    : { hasRequest: false, type: "", title: "", content: "", playerColor: "" };

  $: oldMovesLength =
    $room?.state.strMoves.length > 0 ? $room.state.strMoves.length : 0;

  const eventBus = new EventBus();

  const gameCtx = setGameContext(new GameModel(eventBus), "online");
  const { game } = gameCtx;

  let opponentColor: Color;

  let winSound = new Audio(winAudioSrc);
  let lossSound = new Audio(lossAudioSrc);

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

      if ($room.state.result) {
        $game.result = $room.state.result;
        $game.terminationReason = $room.state.terminationReason;
      }

      roomSize = $room.state.players.size;

      if ($room.state.minutes !== 999999999) {
        minutes = $room.state.minutes;
        ws = $room.state.whiteClock <= 0 ? 0 : $room.state.whiteClock;
        bs = $room.state.blackClock <= 0 ? 0 : $room.state.blackClock;
      } else {
        minutes = Infinity;
      }
    });

    $room.state.players.onChange(() => {
      if (isReset) {
        let newTeam: Color = $team === "White" ? "Black" : "White";
        $team = newTeam;
        $team = $team;
        opponentColor = $team === "White" ? "Black" : "White";
        if ($room.state.minutes !== 999999999) {
          minutes = $room.state.minutes;
          ws = $room.state.whiteClock <= 0 ? 0 : $room.state.whiteClock;
          bs = $room.state.blackClock <= 0 ? 0 : $room.state.blackClock;
        } else {
          minutes = Infinity;
          ws = Infinity;
          bs = Infinity;
          ws = ws;
          bs = bs;
        }
      }
      isReset = false;
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
        if (
          $room.state.strMoves.length !== $game.moves.length &&
          $room.state.strMoves.length !== 0
        ) {
          updateGameState([...$room.state.strMoves]);
        } else if ($room.state.strMoves.length === 0) {
          isReset = true;
          gameCtx.reset();
          $game = $game;
        }
      }
      oldMovesLength = $room.state.strMoves.length;
    });

    $room.onMessage("opponentLeft", () => {
      hasOpponentLeft = true;

      playerAwayInt = setTimeout(() => {
        hasOpponentLeft = false
        const result = $team === "White" ? "1-0" : "0-1";
        $game.terminate({
          result,
          reason: "opponent disconnected",
        });
        $game = $game;
      }, 20000);
    });

    $room.onMessage("opponentIsBack", (message) => {
      hasOpponentLeft = false;
      isReconnect = true;

      clearTimeout(playerAwayInt);

      if (message.result) {
        $game.result = message.result;
        $game.terminationReason = message.terminationReason;
      }

      setTimeout(() => {
        isReconnect = false;
      }, 5000);
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
    const isGameOver = $game.isGameOver;
    let gameOverMessage = {};
    if (isGameOver) {
      gameOverMessage = {
        result: $game.result,
        terminationReason: $game.resultText,
      };
    }

    if ($team === event.detail.move.player.color) {
      const message = {
        move: event.detail.move.toString(),
        color: event.detail.move.player.color,
        isGameOver,
        ...gameOverMessage,
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

  function handlePlayAgain() {
    console.log("this again");
    $room.send("reset");
  }

  $: if ($game.result) {
    if (
      ($team === "White" && $game.result === "1-0") ||
      ($team === "Black" && $game.result === "0-1")
    ) {
      winSound.play();
    } else {
      lossSound.play();
    }
  }
</script>

<svelte:head>
  <title>Chess | Online</title>
</svelte:head>

<div class="toast">
  {#if hasOpponentLeft}
    <Toast type={"disconnect"} />
  {:else if isReconnect}
    <Toast type={"reconnect"} />
  {/if}
</div>

<div class="container">
  <section class="board-container">
    <section class="player-info-container user">
      {#if $team}
        <CapturePool
          player={$team === "White" ? $game.whitePlayer : $game.blackPlayer}
        />

        {#if minutes}
          <GameClock
            {minutes}
            seconds={$team === "White" ? ws : bs}
            {roomSize}
            color={$team}
            client={$team}
            isMultiPlayer
            {isMuted}
          />
        {/if}
      {/if}
    </section>

    <Game
      on:move={handleMove}
      on:playAgain={handlePlayAgain}
      team={$team}
      isMultiPlayer={true}
      {isMuted}
    />

    <section class="player-info-container opponent">
      {#if $team}
        <CapturePool
          player={$team === "White" ? $game.blackPlayer : $game.whitePlayer}
        />
        {#if minutes}
          <GameClock
            {minutes}
            seconds={$team === "White" ? bs : ws}
            {roomSize}
            color={opponentColor}
            client={$team}
            isMultiPlayer
            {isMuted}
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
      <MoveList {minutes} on:playAgain={handlePlayAgain} />
    {/if}
    <AudioToggle bind:isMuted />
  </section>

  {#if roomSize !== 2 && !$game.result}
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
    gap: 0px 1rem;
  }

  .user {
    grid-area: user;
  }

  .opponent {
    grid-area: opponent;
  }

  .toast {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    width: 100%;
    display: flex;
    margin-top: 1rem;
    justify-content: center;
    flex-direction: column;
    z-index: 1000;
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
      grid-template-columns: auto;
      grid-template-rows: 3fr 2fr 1fr;
      grid-template-areas: "clock clock clock" "icon name name" "pieces pieces pieces";
      background-color: rgba(255, 255, 255, 0.08);
      padding: 1em;
      min-width: 160px;
      max-height: 200px;
    }

    .container {
      margin: 2em auto;
      grid-template-columns: 2fr 1fr;
      grid-template-areas: "board info";
    }

    .user {
      place-self: start;
      padding-bottom: 3em;
    }

    .board-container {
      display: grid;
      grid-template-rows: 1fr 1fr;
      grid-template-columns: 1fr 2fr;
      grid-template-areas: "opponent board" "user board";
      width: fit-content;
      height: fit-content;
      gap: 0em 1em;
    }

    .opponent {
      place-self: end;
      padding-top: 5em;
    }

    .game-info-container {
      margin: auto;
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
    }
    .board-container {
      display: grid;
      grid-template-areas: "opponent" "board" "user";
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

    .user {
      margin-top: 1em;
    }
  }
</style>
