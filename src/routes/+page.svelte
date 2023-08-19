<script>
  import openDialog from '$lib/components/dialogs';
    import boardImg from '$lib/images/board.png';
    openDialog()
</script>

<main>
    <h1>Welcome to some guy's chess website</h1>
    
    <div class="container">
    
        <a href="/game-type/local" class="board-btn">
                <img src={boardImg} alt="chess board" class="board"/>
        </a>
    
        <a href="/game-type/local" class="btn local">Play On Same Computer</a>
        <a href="/game-type/online" class="btn online">Play Online With Friends</a>
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

    .container {
        display: grid;
        grid-template-columns: 2fr 1fr;
        grid-template-rows: auto;
        grid-template-areas: "board local" "board online";
        gap: 1em;
    }


    a {
        cursor: pointer;
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

    .local {
        grid-area: local;
        align-self: end;
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
