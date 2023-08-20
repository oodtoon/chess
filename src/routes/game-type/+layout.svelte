<script>
    import { onMount } from "svelte"
    import "$lib"
    import { ChessGameController } from "$lib";

    onMount(() => {
        const controller = new ChessGameController()
        controller.initialize()
    })
</script>

<div class="container">
      <h2 class="turn" id="turn">White's Turn</h2>

      <chess-board id="main-game"></chess-board>

      <game-buttons class="game-btns"></game-buttons>
      <moves-list class="moves-list"></moves-list>

      <section class="capture-container">
        <div id="captured-black">
          <h2>Whites's Pieces Taken</h2>
          <div id="black-pieces"></div>
        </div>
        <div id="captured-white">
          <h2>Black's Pieces Taken</h2>
          <div id="white-pieces"></div>
        </div>
      </section>

      <end-game-dialog class="end-game-dialog"></end-game-dialog>
      <undo-dialog class="undo-dialog"></undo-dialog>
      <review-dialog class="review-dialog"></review-dialog>
      <promotion-dialog class="promotion-dialog"></promotion-dialog>
</div>

<slot />

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

#captured-black {
  grid-area: captured-black;
  color: #49a6e9;
}

#captured-black > h2 {
  color: #49a6e9;
  font-size: 25px;
  font-weight: 800;
}

#captured-white {
  grid-area: captured-white;
}
#captured-white > h2 {
  color: brown;
  font-size: 25px;
  font-weight: 800;
}

#white-pieces {
  min-height: 100px;
  border: solid rgb(23, 23, 23) 5px;
  background-color: brown;
  display: flex;
  flex-wrap: wrap;
}

chess-piece {
  width: var(--captured-piece-size);
  height: var(--captured-piece-size);
}

#black-pieces {
  min-height: 100px;
  border: solid rgb(23, 23, 23) 5px;
  background-color: #49a6e9;
  display: flex;
  flex-wrap: wrap;
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