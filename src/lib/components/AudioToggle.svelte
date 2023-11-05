<script lang="ts">
  import SoundIcon from "./icons/SoundIcon.svelte";
  import MuteIcon from "./icons/MuteIcon.svelte";

  export let isMuted = false;

  function toggleSound() {
    isMuted = !isMuted;
  }
</script>

<button class="audio-btn" on:click={toggleSound}>
  {#if !isMuted}
    <SoundIcon />
  {:else}
    <MuteIcon />
  {/if}
</button>

<style>
  .audio-btn {
    background-color: transparent;
    align-self: flex-end;
  }

  .audio-btn:hover {
    cursor: pointer;
  }

</style>
