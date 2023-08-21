<script lang="ts">
  export let open = true;
  let className = ""
  export {className as class}
  export let id = ""
  let dialogRef: HTMLDialogElement;

  $: if (open) {
    dialogRef?.showModal();
  } else {
    dialogRef?.close();
  }

</script>

<dialog bind:this={dialogRef} class={className} {id}>
  <!-- svelte-ignore missing-declaration -->
  <form method="dialog" on:submit>
    <slot/>
  </form>
</dialog>

<style>
  dialog {
    border-radius: 8px;
    border: 3px solid black;
  }

  ::backdrop {
    background-color: black;
    opacity: 0.3;
  }
</style>
