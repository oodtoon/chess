<script lang="ts">
  import Board from "./Board.svelte";
  import ChessPiece from "./ChessPiece.svelte";
  import GhostMove from "./GhostMove.svelte";
  import { createEventDispatcher, onMount } from "svelte";
  import { getGameContext } from "../context";
  import type Player from "$lib/models/player";
  import {
    displayEndGameDialog,
    displayPromotionDialog,
  } from "$lib/controllers/utils/dialog-utils";
  import type { Piece } from "$lib/models/pieces";
  import { promotedPieceType, isUndoMove } from "$lib/store";
  import { promote } from "$lib/models/pieces";
  import type { BaseMove } from "$lib/models/move";


  export let team: string;
  $: teamColor = team === "w" ? "White" : "Black";

  const gameContext = getGameContext();
  let { game, moveList } = gameContext;
  const dispatch = createEventDispatcher();

  $: eventBus = $game.eventBus;
  $: Object.assign(window, { game: $game });

  let rotate: boolean;
  $: if (team === "w" || !team) {
    rotate = false;
  } else {
    rotate = true;
  }

  let turn: HTMLElement;
  let endGameDialog: HTMLDialogElement;
  let promotionDialog: HTMLDialogElement;
  let undoDialog: HTMLDialogElement;
  let reviewDialog: HTMLDialogElement;

  let whitePieces: HTMLElement;
  let blackPieces: HTMLElement;

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
    
    if (teamColor !== piece.color) {
      return
    }

    if (piece.color !== $game.getActivePlayer().color) {
      return;
    } else {
      if (selectedPiece === piece) {
        selectedPiece = null;
      } else {
        selectedPiece = piece;
      }
    }
  }

  let selectedPiece: Piece | null;
  $: ghostMoves = selectedPiece ? $game.getMoves(selectedPiece) : [];

  $: if ($isUndoMove) {
    const activePlayer = $game.getActivePlayer();
    updatePlayerTurnAndText(activePlayer);

    $isUndoMove = false;
  }

  async function handleMove(event: CustomEvent) {
    const activePlayer = $game.getActivePlayer();
    checkForTerminalState(activePlayer);
    updatePlayerTurnAndText(activePlayer);
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
        displayEndGameDialog(gameContext);
      }, 500);
    }
  }

  function updatePlayerTurnAndText(activePlayer: Player) {
    turn.textContent = `${activePlayer.opponent.color}'s Turn`;
  }

  async function handleGhostMove(event: CustomEvent<BaseMove>) {
    if ($promotedPieceType) {
      game = game;
      $promotedPieceType = null;
    }

    const move = event.detail;

    if (move.isPromotion) {
      const chosenPromotionPiece = await displayPromotionDialog(gameContext);
      const promotedPiece = promote(move, chosenPromotionPiece);
      move.pieceToPromoteTo = promotedPiece;
      $promotedPieceType = promotedPiece;
    } 
    
    $game.doMove(move)
    selectedPiece = null;
    $game = $game;
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

<style>
</style>
