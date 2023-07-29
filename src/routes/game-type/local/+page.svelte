

<svelte:head>
	<title>Chess | Local</title>

</svelte:head>

<div class="text-column">
  <div>
		<slot />
	</div>
</div>

<style>
       :root {
  --responsive-size: 5rem;
  --min-size: 3rem;
  --captured-piece-size: 3rem;
  --element-size: 1rem;
}


.board {
  width: calc(var(--responsive-size) * 8);
  height: calc(var(--responsive-size) * 8);
  min-width: calc(var(--min-size) * 8);
  min-height: calc(var(--min-size) * 8);
  border: solid rgb(23, 23, 23) 5px;
  display: flex;
  flex-wrap: wrap-reverse;
  margin: 3em auto;
  box-shadow: 0px 0px 20px 10px rgb(185, 184, 184);
  grid-area: board;
  place-self: start;
    }


</style>