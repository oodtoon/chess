<script lang="ts">
  import Board from "./Board.svelte";
  import ChessPiece from "./ChessPiece.svelte";
  import GhostMove from "./GhostMove.svelte";
  import { createEventDispatcher, onMount } from "svelte";
  import { getGameContext } from "../context";
  import type Player from "$lib/models/player";
  import type { Piece } from "$lib/models/pieces";
  import { promote } from "$lib/models/pieces";
  import type { BaseMove } from "$lib/models/move";
  import Promotion from "./dialogs/Promotion.svelte";
  import End from "./dialogs/End.svelte";

  export let isMultiPlayer: boolean = false;
  export let team: string = "White";

  const gameContext = getGameContext();
  let { game, moveList } = gameContext;
  const dispatch = createEventDispatcher();

  $: eventBus = $game.eventBus;
  $: Object.assign(window, { game: $game });

  let rotate: boolean = false;

  let turn: HTMLElement;
  let endGameDialog: HTMLDialogElement;
  let promotionDialog: HTMLDialogElement;
  let undoDialog: HTMLDialogElement;
  let reviewDialog: HTMLDialogElement;

  let whitePieces: HTMLElement;
  let blackPieces: HTMLElement;

  let selectedPiece: Piece | null;
  $: ghostMoves = selectedPiece ? $game.getMoves(selectedPiece) : [];

  let promotionMove: BaseMove | null = null;
  let isClosed = false;

  onMount(() => {
    eventBus.addEventListener("move", handleMove);

    turn = document.getElementById("turn") as HTMLElement;

    whitePieces = document.getElementById("White-pieces")!;
    blackPieces = document.getElementById("Black-pieces")!;

    endGameDialog = document.querySelector(
      "end-game-dialog"
    ) as HTMLDialogElement;

    promotionDialog = document.querySelector(
      "promotion-dialog"
    ) as HTMLDialogElement;

    undoDialog = document.querySelector("undo-dialog") as HTMLDialogElement;

    reviewDialog = document.querySelector("review-dialog") as HTMLDialogElement;

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

  function handleMove(event: CustomEvent<BaseMove>) {
    const activePlayer = $game.getActivePlayer();
    checkForTerminalState(activePlayer);
    dispatch("move", event.detail);
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
  } else {
    rotateBoard($moveList);
  }

  function handleEndGameClose() {
    isClosed = true;
  }
</script>

<Board {rotate} let:row let:file>
  {@const piece = $game.board.get(row, file)}
  {#if piece}
    <ChessPiece
      {piece}
      active={piece === selectedPiece}
      on:click={() => handlePieceClick(piece)}
      captured={false}
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
  <End {gameContext} on:close={handleEndGameClose} />
{/if}

<style>
</style>
