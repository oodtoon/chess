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
  import {
    displayEndGameDialog,
    displayReviewDialog,
    displayUndoMoveDialog,
    displayWaitingDialog,
  } from "$lib/controllers/utils/dialog-utils.js";
  import type { Request, Response } from "$lib/type.js";

  export let data;
  let oldMovesLength: number = 0;
  const { room, team, pin } = data;

  const eventBus = new EventBus();

  const gameCtx = setGameContext(new GameModel(eventBus), "online");
  const { game } = gameCtx;

  function getTurnText(game: GameModel) {
    return game.resultText ?? `${game.getActivePlayer().color}'s Turn`;
  }

  let isRequestStateChange = false;

  onMount(() => {
    setupRoom();
  });

  async function setupRoom() {
    if (!$room) {
      console.log("pin", pin);
      $room = await joinPrivateRoom(pin);
    }
    let stopWaiting: () => void;

    $room.state.players.onAdd((player: any, sessionId: string) => {
      console.log("player:", sessionId, player.color, "has joined");

      if (sessionId === $room.sessionId) {
        $team = player.color;
      }
      if ($room.state.strMoves.length > 0) {
        setAllPieces([...$room.state.strMoves]);
      }
      if ($room.state.players.size === 1) {
        displayWaitingDialog(
          new Promise((resolve) => {
            stopWaiting = resolve;
          }),
          true
        );
      } else {
        stopWaiting?.();
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
        setAllPieces([...$room.state.strMoves]);
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
      displayEndGameDialog(gameCtx);
      $game = $game;
    });
  }

  function handleMove(event: CustomEvent<{ move: BaseMove }>) {
    if ($team === event.detail.move.player.color) {
      const message = {
        move: event.detail.move.toString(),
        color: event.detail.move.player.color,
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
        drawGame(type);
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
    isRequestStateChange = false;
  }

  function drawGame(type: string) {
    $game.terminate({
      result: "1/2-1/2",
      reason: "draw agreed",
    });

    displayEndGameDialog(gameCtx);
    $game = $game;
  }

  async function handleDrawWaiting() {
    displayWaitingDialog(
      new Promise((resolve) => {
        $room.onMessage("response", (message: Response) => {
          resolve();
          if (message.type === "draw") {
            drawGame(message.type);
          }
        });
      })
    );
  }

  async function handleUndoWaiting() {
    displayWaitingDialog(
      new Promise((resolve) => {
        $room.onMessage("response", resolve);
      })
    );
  }

  $: $room?.state.requestState.onChange(async () => {
    if (!$room.state.requestState.hasRequest) {
      return;
    }

    if ($team === $room.state.requestState.playerColor) {
      switch ($room.state.requestState.type) {
        case "draw": {
          await handleDrawWaiting();
          break;
        }
        case "undoMove": {
          await handleUndoWaiting();
          break;
        }
      }
    } else {
      if (!isRequestStateChange) {
        isRequestStateChange = true;
        const { type, title, content } = $room.state.requestState;
        const { accepted } = await displayReviewDialog(title, content);
        sendResponse(type, accepted);
      }
    }
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
      let playerColor = $room.state.players.get($room.sessionId).color;
      const undoRequest = await displayUndoMoveDialog(playerColor);
      $room.send("request", {
        type: "undoMove",
        title: undoRequest!.title,
        content: undoRequest!.content,
      });
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
