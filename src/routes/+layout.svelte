<script>
  import { navigating } from "$app/stores";
  import { abort } from "$lib/components/dialogs";
  import "./styles.css";

  $: if ($navigating) {
    console.log(
      "to:",
      $navigating.to?.url.href,
      "from:",
      $navigating.from?.url.href
    );
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
