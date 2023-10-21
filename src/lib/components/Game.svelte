<script lang="ts">
  import Board from "./Board.svelte";
  import ChessPiece from "./ChessPiece.svelte";
  import GhostMove from "./GhostMove.svelte";
  import BoardNotation from "./BoardNotation.svelte";
  import { createEventDispatcher, onMount, tick } from "svelte";
  import { getGameContext } from "../context";
  import type Player from "$lib/models/player";
  import type { Piece } from "$lib/models/pieces";
  import { promote } from "$lib/models/pieces";
  import type { BaseMove } from "$lib/models/move";
  import Promotion from "./dialogs/Promotion.svelte";
  import End from "./dialogs/End.svelte";
  import captureAudioSrc from "$lib/audio/capture.mp3";
  import checkAudioSrc from "$lib/audio/check.mp3";
  import moveAudioSrc from "$lib/audio/move.mp3";

  import { gsap } from "gsap/dist/gsap";
  import { Flip } from "gsap/dist/Flip";

  export let isMultiPlayer: boolean = false;
  export let team: string = "White";

  export let isMuted: boolean

  let isMounted = false;

  const gameContext = getGameContext();
  let { game, moveList } = gameContext;
  const dispatch = createEventDispatcher();

  $: eventBus = $game.eventBus;
  $: Object.assign(window, { game: $game });

  let rotate: boolean = false;

  let turn: HTMLElement;

  let whitePieces: HTMLElement;
  let blackPieces: HTMLElement;

  let selectedPiece: Piece | null;
  $: ghostMoves = selectedPiece ? $game.getMoves(selectedPiece) : [];

  let promotionMove: BaseMove | null = null;
  let isClosed = false;

  let checkSound = new Audio(checkAudioSrc);
  let captureSound = new Audio(captureAudioSrc);
  let moveSound = new Audio(moveAudioSrc);

  onMount(() => {
    eventBus.addEventListener("move", handleMove);

    turn = document.getElementById("turn") as HTMLElement;

    whitePieces = document.getElementById("White-pieces")!;
    blackPieces = document.getElementById("Black-pieces")!;

    isMounted = true;
    return () => {
      eventBus.removeEventListener("move", handleMove);
    };
  });

  function handlePieceClick(piece: Piece) {
    if (isMultiPlayer && team !== piece.color) {
      return;
    }

    if (piece.color !== $game.getActivePlayer().color) {
    } else {
      if (selectedPiece === piece) {
        selectedPiece = null;
      } else {
        selectedPiece = piece;
      }
    }
  }

  function handleDocumentClick(event: MouseEvent) {
    if (selectedPiece) {
      const target = event.target as HTMLElement;
      const activePiece = document.querySelector(".piece.active");
      if (!activePiece?.contains(target)) selectedPiece = null;
    }
  }

  function handleMove(event: CustomEvent) {
    const activePlayer = $game.getActivePlayer();
    checkForTerminalState(activePlayer);
    dispatch("move", event.detail);

    if (isMuted) {
      return
    }

    const { move } = event.detail;
    if (move.isCheck) {
      checkSound.play();
    } else if (move.capturedPiece) {
      captureSound.play();
    } else {
      moveSound.play();
    }
  }

  function checkForTerminalState(activePlayer: Player) {
    if (activePlayer.opponent.moves.length === 0) {
      setTimeout(() => {
        if ($game.isPlayerInCheck()) {
          $game.terminate({
            result: activePlayer.isWhite ? "1-0" : "0-1",
            reason: "checkmate",
          });
        } else {
          $game.terminate({
            result: "1/2-1/2",
            reason: "stalemate",
          });
        }
        $game = $game;
      }, 500);
    }
  }

  function rotateBoard(_: BaseMove[]) {
    if ($game.getActivePlayer() !== $game.whitePlayer) {
      rotate = true;
    } else {
      rotate = false;
    }
  }

  function handlePromotion(event: CustomEvent) {
    if (promotionMove) {
      const promotedPiece = promote(promotionMove, event.detail);
      promotionMove.pieceToPromoteTo = promotedPiece;
      $game.doMove(promotionMove);
      selectedPiece = null;
      $game = $game;
    }
    promotionMove = null;
  }

  async function handleGhostMove(event: CustomEvent<BaseMove>) {
    const move = event.detail;

    if (move.isPromotion) {
      promotionMove = move;
      return;
    }

    $game.doMove(move);
    selectedPiece = null;
    $game = $game;
  }

  $: if (isMultiPlayer) {
    rotate = team === "White" ? false : true;
    $moveList;
    if (isMounted) {
      animatePieceMove();
    }
  } else {
    rotateBoard($moveList);
  }

  function handleEndGameClose() {
    isClosed = true;
  }

  gsap.registerPlugin(Flip);

  async function animatePieceMove() {
    const lastMove = $moveList.at(-1);
    if (!lastMove) return;
    const { initiatingPiece } = lastMove;
    const state = Flip.getState(`[data-flip-id=piece-${initiatingPiece?.id}]`);
    await tick();

    Flip.from(state, {
      targets: ".livePiece",
      duration: 0.3,
      toggleClass: "flipping",
    });
  }
</script>

<svelte:document on:click={handleDocumentClick} />

<section class="board">
  <Board {rotate} let:row let:file>
    <BoardNotation {rotate} {row} {file} />

    {@const piece = $game.board.get(row, file)}
    {#if piece}
      <ChessPiece
        {piece}
        active={piece === selectedPiece}
        on:click={() => handlePieceClick(piece)}
        captured={false}
        isDisabled={$game.result !== null}
      />
    {/if}

    {#each ghostMoves as ghostMove}
      {@const piece = $game.board.getSquareContent(row, file)}
      {#if ghostMove.row === row && ghostMove.file === file}
        <GhostMove
          isCapturedPiece={!!piece}
          move={ghostMove}
          on:click={handleGhostMove}
        />
      {/if}
    {/each}
  </Board>

  {#if promotionMove}
    <Promotion {gameContext} on:close={handlePromotion} />
  {/if}

  {#if $game.result && !isClosed}
    <End {gameContext} on:close={handleEndGameClose} on:playAgain/>
  {/if}
</section>

<style>
  .board {
    grid-area: board;
    place-self: center;
  }
</style>
