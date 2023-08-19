<script lang="ts">
  export let open = false;
  export let heading;
  let dialogRef: HTMLDialogElement;

  $: if (open) {
    dialogRef?.showModal();
  } else {
    dialogRef?.close();
  }
</script>

<dialog bind:this={dialogRef}>
  <form action="">
    <slot>
      <slot name="heading">
        {heading}
      </slot>
      <slot name="content" />
    </slot>
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
