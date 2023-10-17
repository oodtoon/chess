<script lang="ts">
  import { goto } from "$app/navigation";
  import { createLocalRoom, createRoom } from "$lib/client";
  import InfinityIcon from "$lib/components/icons/InfinityIcon.svelte";
  import boardImg from "$lib/images/board.png";
  import type { GameMinutes } from "$lib/type.js";
  import type { Room } from "colyseus.js";

  export let data;

  let room: Room;
  let roomId: string;

  let timeOptions: number[] = [Infinity, 1, 2, 3, 5, 10, 30, 60];
  let chosenTime: GameMinutes = Infinity;

  async function setUpRoom(isMultiPlayer: boolean) {
    if (isMultiPlayer) {
      room = await createRoom(chosenTime);
    } else {
      room = await createLocalRoom(chosenTime);
    }

    roomId = room.roomId;
    data.room.set(room);
  }

  async function createRoomPin(isMultiPlayer: boolean) {
    let roomType = isMultiPlayer ? "online" : "local";
    await setUpRoom(isMultiPlayer);

    if (isMultiPlayer) {
      await navigator.clipboard.writeText(
        `${window.location.origin}/${roomType}/${room.roomId}`
      );

      window.alert(
        "Room URL is saved to your clipboard. Share with a friend to play online!"
      );
    }

    goto(`/${roomType}/${roomId}`);
  }
</script>

<div class="container">
  <h1>Welcome to some guy's chess website</h1>

  <div class="interface-container">
    <button on:click={() => createRoomPin(false)} class="board-btn">
      <img src={boardImg} alt="chess board" class="board-img" />
    </button>

    <div class="time-select">
      <p class="time-title">Select minutes per player:</p>
      <div class="radio-container">
        {#each timeOptions as time}
          <label
            class="radio-input"
            class:selected-time={chosenTime === time}
            class:edge-radio={time === 60}
            tabindex={time === chosenTime ? 0 : -1}
            style={"max-width: 1em"}
            ><input
              type="radio"
              name="minutes"
              value={time}
              bind:group={chosenTime}
            />
            {#if time !== Infinity}
              {time.toString()}
            {:else}
              <InfinityIcon />
            {/if}
          </label>
        {/each}
      </div>
    </div>

    <button on:click={() => createRoomPin(false)} class="btn local"
      >Play On Same Computer</button
    >
    <button on:click={() => createRoomPin(true)} class="btn online"
      >Create Game To Share</button
    >
  </div>
</div>

<style>
  :root {
    --responsive-size: 3rem;
    --min-size: 1rem;
  }
  h1 {
    color: white;
  }
  button {
    cursor: pointer;
  }

  button:hover {
    box-shadow: 0.2em 0.2em 0.2em black;
  }
  .container {
    display: grid;
    max-width: 1200px;
    margin: 0 auto;
  }
  .interface-container {
    display: grid;
    grid-template-columns: 2fr 1fr;
    grid-template-rows: auto;
    grid-template-areas: "local time-select" "online time-select" "board board";
    gap: 1em;
  }
  .btn {
    font-size: 1.5rem;
    font-weight: 700;
    text-decoration: none;
    background-color: white;
    padding: 2em 0;
    display: flex;
    place-content: center;
  }

  .board-btn {
    grid-area: board;
    width: calc(var(--responsive-size) * 8);
    height: calc(var(--responsive-size) * 8);
    min-width: calc(var(--min-size) * 8);
    min-height: calc(var(--min-size) * 8);
    padding: 0;
    box-sizing: content-box;
    border: 6px solid black;
    place-self: center;
  }

  .board-img {
    width: calc(var(--responsive-size) * 8);
    height: calc(var(--responsive-size) * 8);
  }

  .time-select {
    grid-area: time-select;
    color: white;
    align-self: center;
  }

  .time-title {
    font-size: 1.3rem;
    font-weight: 500;
  }
  .radio-container {
    display: flex;
  }

  .radio-input input[type="radio"] {
    height: 0;
    width: 0;
    margin: 0;
  }

  .radio-input {
    display: flex;
    justify-content: center;
    padding: 1em;
    border-right: 1px solid grey;
  }

  .edge-radio {
    border: none;
  }
  .radio-input:hover {
    cursor: pointer;
  }

  .selected-time {
    background-color: brown;
    box-shadow: 4px 4px black;
  }
  .local {
    grid-area: local;
    align-self: end;
  }

  .local {
    color: brown;
    border: 3px solid brown;
  }

  .local:hover {
    color: white;
    background-color: brown;
  }

  .online {
    grid-area: online;
    align-self: start;
    color: #49a6e9;
    border: 3px solid #49a6e9;
  }

  .online:hover {
    color: white;
    background-color: #49a6e9;
  }


  @media (min-width: 700px) {
    :root {
      --responsive-size: 8vw;
    }

    .board-btn {
      place-self: center;
    }


  }

  @media (min-width: 1000px) {
    :root {
      --responsive-size: 5rem;
    }
    .interface-container {
      grid-template-areas: "board time-select" "board local" "board online";
    }
  }
</style>
