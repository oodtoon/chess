<script lang="ts">
  // import { selectedPiece } from "../store";
  export let rotate: boolean;

  // function handleClick() {
  //   console.log($selectedPiece)
  // }

</script>

<div class="board" class:rotate>
  {#each { length: 64 } as _, index}
    {@const row = Math.floor(index / 8)}
    {@const file = index % 8}
    {@const offset = row % 2}
    <div
      class="square"
      class:black={(index + offset) % 2 === 0}
      class:white={(index + offset) % 2 === 1}
      class:rotate
    >
      <slot {row} {file} />
    </div>
  {/each}
</div>

<style>
  .board {
    width: calc(var(--responsive-size) * 8);
    height: calc(var(--responsive-size) * 8);
    min-width: calc(var(--min-size) * 8);
    min-height: calc(var(--min-size) * 8);
    border: solid rgb(23, 23, 23) 5px;
    display: flex;
    flex-wrap: wrap-reverse;
    margin: 3em auto;
    grid-area: board;
    box-shadow: 0px 0px 20px 10px rgb(185, 184, 184);
    place-self: start;
  }

  .square {
    width: var(--responsive-size);
    min-width: var(--min-size);
    aspect-ratio: 1;
    font-size: calc(var(--responsive-size) * 0.75);
    text-align: center;
    position: relative;
    display: flex;
  }

  .black {
    background-color: brown;
  }

  .white {
    background-color: white;
  }

  .rotate {
    transform: rotate(180deg);
  }

  @media (min-width: 700px) {
    .square {
      width: var(--responsive-size);
    }
  }

  @media (min-width: 1000px) {
    .square {
      width: var(--responsive-size);
      max-height: 88px;
      max-width: 88px;
      min-width: 75px;
      min-height: 75px;
    }
  }
</style>
