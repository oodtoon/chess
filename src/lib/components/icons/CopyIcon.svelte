<script lang="ts">
  export let copied: boolean;
</script>

{#if !copied}
  <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 16 16"
    ><path
      fill="currentColor"
      d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"
    /><path
      fill="currentColor"
      d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"
    /></svg
  >
{:else}
  <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 12 16"
    ><path
      fill-rule="evenodd"
      d="M12 5l-8 8l-4-4l1.5-1.5L4 10l6.5-6.5L12 5z"
      fill="currentColor"
    /></svg
  >
{/if}

<style>
  .icon {
    height: var(--icon-size);
    width: var(--icon-size);
  }
</style>
