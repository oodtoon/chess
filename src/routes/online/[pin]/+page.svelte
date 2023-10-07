<script lang="ts">
  import EventBus from "$lib/event-bus";
  import CapturePool from "$lib/components/CapturePool.svelte";
  import GameModel, { consumeToken } from "$lib/models/game";

  import GameButtons from "$lib/components/GameButtons.svelte";
  import MoveList from "$lib/components/MoveList.svelte";
  import { setGameContext } from "$lib/context";

  import { joinPrivateRoom } from "$lib/client";
  import { onMount } from "svelte";
  import type { BaseMove } from "$lib/models/move";
  import { derivePgnFromMoveStrings, parsePgn } from "$lib/io";
  import Game from "$lib/components/Game.svelte";
  import { getUndoTitle } from "$lib/controllers/utils/dialog-utils.js";
  import type { Response } from "$lib/type.js";
  import Waiting from "$lib/components/dialogs/Waiting.svelte";
  import Review from "$lib/components/dialogs/Review.svelte";
  import Undo from "$lib/components/dialogs/Undo.svelte";

  export let data;

  let roomSize = 0;
  let isUndoDialog = false;
  const { room, team, pin } = data;

  let shouldCommitMove = true;

  $: dialogState = $room
    ? $room?.state.requestState
    : { hasRequest: false, type: "", title: "", content: "", playerColor: "" };

  $: oldMovesLength =
    $room?.state.strMoves.length > 0 ? $room.state.strMoves.length : 0;

  const eventBus = new EventBus();

  const gameCtx = setGameContext(new GameModel(eventBus), "online");
  const { game } = gameCtx;

  function getTurnText(game: GameModel) {
    return game.resultText ?? `${game.getActivePlayer().color}'s Turn`;
  }

  onMount(() => {
    setupRoom();
  });

  async function setupRoom() {
    if (!$room) {
      $room = await joinPrivateRoom(pin);
    }

    $room.state.players.onAdd((player: any, sessionId: string) => {
      console.log("player:", sessionId, player.color, "has joined");

      if (sessionId === $room.sessionId) {
        $team = player.color;
      }

      roomSize = $room.state.players.size;
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
        if ($room.state.strMoves.length !== $game.moves.length) {
          updateGameState([...$room.state.strMoves]);
        }
      }
      oldMovesLength = $room.state.strMoves.length;
    });

    $room.onMessage("rejoin", (message) => {
      shouldCommitMove = false;

      setAllPieces(message.moves);

      shouldCommitMove = true;
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
  }

  function handleMove(event: CustomEvent<{ move: BaseMove }>) {
    if ($team === event.detail.move.player.color) {
      const message = {
        move: event.detail.move.toString(),
        color: event.detail.move.player.color,
        shouldCommitMove,
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

  function setAllPieces(strMoves: string[]) {
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

  <Game on:move={handleMove} team={$team} isMultiPlayer />
  <MoveList />
  <GameButtons
    on:draw={handleDraw}
    on:undo={handleUndo}
    on:resign={handleResign}
  />

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
    grid-template-areas: "turn" "board" "btns" "moves-list";
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
        ". moves-list";
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
        ". board  .";
    }

    .capture-container {
      display: block;
      margin: 0;
    }
  }
</style>
