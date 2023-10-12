<script lang="ts">
  import { getGameContext } from "$lib/context";
  import UndoIcon from "./UndoIcon.svelte";
  import FlagIcon from "./icons/FlagIcon.svelte";
  import HandShakeIcon from "./icons/HandShakeIcon.svelte";

  import { createEventDispatcher } from "svelte";
  import PlayAgainIcon from "./icons/PlayAgainIcon.svelte";

  const gameContext = getGameContext();
  const { game } = gameContext;

  const dispatch = createEventDispatcher();

  async function handleDraw() {
    dispatch("draw");
  }

  function handleResign() {
    dispatch("resign", { accepted: true });
  }

  async function handleUndo() {
    dispatch("undo");
  }
</script>

<section class="btns-container dual">
  <button class="draw" type="button" on:click={handleDraw}
    ><span class="word">Draw</span> <span><HandShakeIcon /></span></button
  >
  <button class="resign" type="button" on:click={handleResign}
    ><span class="word">Resign</span> <span><FlagIcon /></span></button
  >
  <button class="undo" type="button" on:click={handleUndo}>
    <span class="word">Undo Move</span>
    <span>
      <UndoIcon />
    </span>
  </button>
</section>

<style>
  .btns-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
    gap: 1em;
    width: 100%;
    margin: 1em;
  }

  .btns-container > button {
    font-size: 1rem;
    font-weight: 800;
    padding: 0.5em 1em;
    background-color: white;
    border-radius: 1px;
    display: flex;
    gap: 1em;
  }

  .btns-container > button:hover {
    color: white;
    cursor: pointer;
    box-shadow: 0.2em 0.2em 0.2em black;
  }

  .word {
    align-self: flex-end;
  }

  .draw {
    border: 3px solid #49a6e9;
    color: #49a6e9;
  }

  .draw:hover {
    background-color: #49a6e9;
  }

  .resign {
    border: 3px solid brown;
    color: brown;
  }

  .resign:hover {
    background-color: brown;
  }

  .undo {
    border: 3px solid black;
    color: black;
  }

  .undo:hover {
    background-color: black;
  }
</style>
