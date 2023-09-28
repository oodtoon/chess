<script lang="ts">
  export let row: number;
  export let file: number;
  export let rotate: boolean;

  let letters = ["a", "b", "c", "d", "e", "f", "g", "h"];
  let nums = [1, 2, 3, 4, 5, 6, 7, 8];
</script>

{#if rotate}
  {#if row === 7}
    <p class="letter notation" class:brown={file % 2 === 0}>
      {letters[file]}
    </p>
  {/if}

  {#if file === 7}
    <p class="number notation" class:brown={row % 2 === 0}>{nums[row]}</p>
  {/if}
{:else}
  {#if row === 0}
    <p class="letter notation" class:brown={file % 2 !== 0}>
      {letters[file]}
    </p>
  {/if}

  {#if file === 0}
    <p class="number notation" class:brown={row % 2 !== 0}>{nums[row]}</p>
  {/if}
{/if}

<style>
  .notation {
    /* font-size: 1rem; */
    font-size: 1rem;
    font-weight: 800;
    position: absolute;
    color: white;
    margin: 0;
  }

  .letter {
    bottom: 0;
    right: 0.25rem;
  }

  .number {
    top: 0;
    left: 0.25rem;
  }

  .brown {
    color: brown;
  }
</style>
