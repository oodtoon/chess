<script>
	import { navigating } from '$app/stores';
	import { createEventDispatcher } from 'svelte';
	import './styles.css';

	const dispatch = createEventDispatcher()

	$: if($navigating) {
		//if navigating away, close it. HIDE IT??
		//if navigating back, check if it need to be opened
		// if so...open it,
		//else, continue as usual
		console.log("to:", $navigating.to?.url.href, "from:", $navigating.from?.url.href)
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


