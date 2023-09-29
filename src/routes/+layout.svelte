<script>
  import { navigating } from "$app/stores";
  import { abort } from "$lib/components/dialogs";
  import "./styles.css";

  $: if ($navigating) {
    abort("page navigating");
  }
</script>

<svelte:head>
  <title>Chess</title>
</svelte:head>

<div class="app">
  <main>
    <slot />
  </main>
</div>
