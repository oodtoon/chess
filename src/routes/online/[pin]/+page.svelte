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
  import Waiting from "$lib/components/dialogs/Waiting.svelte";
  import {
    closeDialog,
    displayEndGameDialog,
    displayReviewDialog,
  } from "$lib/controllers/utils/dialog-utils.js";

  export let data;
  let isRoomFull: boolean = false;
  let isAccepted: boolean;
  const { room, team } = data;

  const eventBus = new EventBus();

  const gameCtx = setGameContext(new GameModel(eventBus));
  const { game } = gameCtx;

  function getTurnText(game: GameModel) {
    return game.resultText ?? `${game.getActivePlayer().color}'s Turn`;
  }

  onMount(() => {
    setupRoom();
  });

  $: if (isRoomFull) {
    closeDialog("waiting");
  }

  async function setupRoom() {
    if (!$room) {
      $room = await joinPrivateRoom(data.pin);
    }
    $room.state.players.onAdd((player: any, sessionId: string) => {
      console.log("player:", sessionId, player.color, "has joined");

      if (sessionId === $room.sessionId) {
        $team = player.color;
      }
      if ($room.state.strMoves.length > 0) {
        resetGameBoard([...$room.state.strMoves]);
      }

      if ($room.state.players.size === 2) {
        isRoomFull = true;
      }
    });
    $room.state.strMoves.onChange(() => {
      updateGameState([...$room.state.strMoves]);
    });

    $room.onMessage("request", (msg) => {
      const { type, title, message } = msg;
      if (message) {
        handleReviewDialog(type, title, message);
      } else {
        handleReviewDialog(type, title);
      }
    });

    $room.onMessage("response", (message) => {
      if (message.type === "draw") {
        $game.terminate({ result: message.result, reason: message.reason });
        $game = $game;
        displayEndGameDialog(gameCtx);
      }
      closeDialog("waiting");
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
    if (newMove?.turn !== $team) {
      consumeToken(newMove!, $game);
    }
    $game = $game;
  }

  function resetGameBoard(strMoves: string[]) {
    const parsedPgn = createPgn(strMoves);
    parsedPgn.moves.forEach((move) => {
      consumeToken(move, $game);
    });
    $game = $game;
  }

  function createPgn(strMoves: string[]) {
    const pgn = derivePgnFromMoveStrings(strMoves);
    return parsePgn(pgn);
  }

  async function handleReviewDialog(type: string, title: string, msg?: string) {
    const accepted = await displayReviewDialog(title, msg);
    isAccepted = accepted.accepted;
    if (isAccepted) {
      if (type === "draw") {
        $room.send("response", {
          type,
          result: "1/2-1/2",
          reason: "draw agreed",
        });
      } else {
        $room.send("response", {
          type,
        });
        game.update(($game) => {
          $game.undoMove();
          return $game;
        });
      }
      $game = $game;
    } else {
      $room.send("response", {
        type: "close",
      });
    }
  }
</script>

<svelte:head>
  <title>Chess | Online</title>
</svelte:head>

<div class="container">
  <Waiting {isRoomFull} />

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

  <Game on:move={handleMove} team={$team} isMultiPlayer={true} />
  <MoveList />
  <GameButtons {data} isMultiPlayer={true} {isAccepted} />
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

  .welcomeMessage {
    color: white;
    font-weight: 800;
    font-size: xx-large;
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
