<script>
  import EventBus from "$lib/event-bus";
  import CapturePool from "$lib/components/CapturePool.svelte";
  import Game from "$lib/components/Game.svelte";
  import GameModel from "$lib/models/game";

  import GameButtons from "$lib/components/GameButtons.svelte";
  import MoveList from "$lib/components/MoveList.svelte";
  import { setGameContext } from "$lib/context";

  import { capturedBlackPieces, capturedWhitePieces } from "$lib/store";
  import End from "$lib/components/dialogs/End.svelte";
  import Promotion from "$lib/components/dialogs/Promotion.svelte";
  import Undo from "$lib/components/dialogs/Undo.svelte";
  import Review from "$lib/components/dialogs/Review.svelte";

  const eventBus = new EventBus();
  let game = new GameModel(eventBus);

  const ctx = setGameContext(game);
  
</script>

<svelte:head>
  <title>Chess | Local</title>
</svelte:head>

<div class="container">
  <h2 class="turn" id="turn">White's Turn</h2>

  <section class="capture-container">
    <CapturePool color="White" capturedPieces={$capturedBlackPieces}/>
    <CapturePool color="Black" capturedPieces={$capturedWhitePieces}/>
  </section>

  <Game />
  <MoveList {game}/>
  <GameButtons {game}/>

  <End {game}/>
  <Promotion {game}/>
  <Undo {game}/>
  <Review {game}/>

  <end-game-dialog class="end-game-dialog" />
  <undo-dialog class="undo-dialog" />
  <review-dialog class="review-dialog" />
  <promotion-dialog class="promotion-dialog" />
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

  chess-board {
    width: calc(var(--responsive-size) * 8);
    height: calc(var(--responsive-size) * 8);
    min-width: calc(var(--min-size) * 8);
    min-height: calc(var(--min-size) * 8);
    border: solid rgb(23, 23, 23) 5px;
    display: flex;
    flex-wrap: wrap-reverse;
    margin: 3em auto;
    box-shadow: 0px 0px 20px 10px rgb(185, 184, 184);
    grid-area: board;
    place-self: start;
  }

  .game-btns {
    grid-area: btns;
    display: block;
  }

  .moves-list {
    grid-area: moves-list;
    display: block;
    border: 3px solid black;
    background-color: aliceblue;
    border-radius: 1em;
    margin-top: 3em;
    margin-bottom: auto;
    width: 100%;
  }
  chess-piece {
    width: var(--captured-piece-size);
    height: var(--captured-piece-size);
  }

  .turn {
    color: #49a6e9;
    grid-area: turn;
    place-self: center;
  }

  end-game-dialog,
  undo-dialog,
  review-dialog,
  promotion-dialog {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
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

    chess-board {
      width: calc(var(--responsive-size) * 8);
      height: calc(var(--responsive-size) * 8);
      margin: auto;
    }

    #white-pieces {
      min-height: 100px;
    }

    #black-pieces {
      min-height: 100px;
    }

    .moves-list {
      margin: auto;
    }

    .turn {
      margin: auto;
      place-self: center;
    }
  }

  @media (min-width: 775px) {
    .moves-list {
      margin-top: 2em;
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

    chess-board {
      width: calc(var(--responsive-size) * 8);
      height: calc(var(--responsive-size) * 8);
      max-height: calc(88px * 8);
      max-width: calc(88px * 8);
      min-width: calc(75px * 8);
      min-height: calc(75px * 8);
      margin: 2em auto;
    }

    .capture-container {
      display: block;
      margin: 0;
    }

    .moves-list {
      justify-self: start;
      width: 100%;
    }
  }
</style>
