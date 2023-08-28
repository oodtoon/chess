<script lang="ts">
  import EventBus from "$lib/event-bus";
  import CapturePool from "$lib/components/CapturePool.svelte";
  // import OnlineGame from "$lib/components/OnlineGame.svelte";
  import GameModel, { consumeToken } from "$lib/models/game";

  import GameButtons from "$lib/components/GameButtons.svelte";
  import MoveList from "$lib/components/MoveList.svelte";
  import { setGameContext } from "$lib/context";

  import { capturedBlackPieces, capturedWhitePieces } from "$lib/store";

  import { joinPrivateRoom } from "$lib/client";
  import { onMount } from "svelte";
  import type { BaseMove } from "$lib/models/move";
  import { derivePgnFromMoveStrings, parsePgn } from "$lib/io";
  import Game from "$lib/components/Game.svelte";

  export let data;
  const { room, team } = data;

  const eventBus = new EventBus();

  const { game } = setGameContext(new GameModel(eventBus));

  function getTurnText(game: GameModel) {
    return game.resultText ?? `${game.getActivePlayer().color}'s Turn`;
  }

  onMount(() => {
    setupRoom();
  });

  async function setupRoom() {
    if (!$room) {
      $room = await joinPrivateRoom(data.pin);
    }
    $room.state.players.onAdd((player: any, sessionId: string) => {
      console.log("player:", sessionId, player.color, "has joined");

      if (sessionId === $room.sessionId) {
        $team = player.color;
        console.log($team);
      }
      if ($room.state.strMoves.length > 0) {
        resetGameBoard([...$room.state.strMoves])
      }

    });
    $room.state.strMoves.onChange(() => {
      updateGameState([...$room.state.strMoves]);
    });
    
  }

  function handleMove(event: CustomEvent<{ move: BaseMove }>) {
    if ($team === event.detail.move.player.color[0].toLowerCase()) {
      const message = {
        move: event.detail.move.toString(),
        color: event.detail.move.player.color.charAt(0).toLowerCase(),
      };
      $room.send("move", message);
    }
  }

  function updateGameState(strMoves: string[]) {
    const parsedPgn = createPgn(strMoves)
    const newMove = parsedPgn.moves.at(-1);
    if (newMove?.turn !== $team) {
      consumeToken(newMove!, $game);
    }
    $game = $game;
  }

  function resetGameBoard(strMoves: string[]) {
    const parsedPgn = createPgn(strMoves)
    parsedPgn.moves.forEach(move => {
      consumeToken(move, $game)
    })
    $game=$game
  }

  function createPgn(strMoves: string[]) {
    const pgn = derivePgnFromMoveStrings(strMoves);
    return parsePgn(pgn);
  }
</script>

<svelte:head>
  <title>Chess | Online</title>
</svelte:head>

<div class="container">
  <h2 class="turn" id="turn">{getTurnText($game)}</h2>

  <section class="capture-container">
    <CapturePool color="White" capturedPieces={$capturedBlackPieces} />
    <CapturePool color="Black" capturedPieces={$capturedWhitePieces} />
  </section>

  <!-- <OnlineGame on:move={handleMove} team={$team} /> -->
  <Game on:move={handleMove} team={$team} isMultiPlayer={true}/>
  <MoveList />
  <GameButtons />
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
