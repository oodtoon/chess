<script lang="ts">
  import { goto } from "$app/navigation";
  import { createLocalRoom, createRoom } from "$lib/client";
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

<main>
  <h1>Welcome to some guy's chess website</h1>

  <div class="container">
    <button on:click={() => createRoomPin(false)} class="board-btn">
      <img src={boardImg} alt="chess board" class="board" />
    </button>

    <div class="time-select">
      <h2>Select minutes each player gets:</h2>
      {#each timeOptions as time}
        <label class="input"
          ><input
            type="radio"
            name="minutes"
            value={time}
            bind:group={chosenTime}
          />
          {#if time !== Infinity}
            {time}
          {:else}
            Unlimited
          {/if}
        </label>
      {/each}
    </div>

    <button on:click={() => createRoomPin(false)} class="btn local"
      >Play On Same Computer</button
    >
    <button on:click={() => createRoomPin(true)} class="btn online"
      >Create Game To Share</button
    >
  </div>
</main>

<style>
  :root {
    --responsive-size: 5rem;
    --min-size: 3rem;
    --captured-piece-size: 3rem;
    --element-size: 1rem;
  }

  main {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 1rem;
    width: 100%;
    max-width: 64rem;
    margin: 0 auto;
    box-sizing: border-box;
  }

  h1 {
    color: white;
  }

  a,
  button {
    cursor: pointer;
  }

  .container {
    display: grid;
    grid-template-columns: 2fr 1fr;
    grid-template-rows: auto;
    grid-template-areas: "board time-select" "board local" "board online";
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
  }

  .board {
    width: calc(var(--responsive-size) * 8);
    height: calc(var(--responsive-size) * 8);
  }

  .time-select {
    grid-area: time-select;
    color: white;
  }

  .input {
    display: block;
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
</style>
