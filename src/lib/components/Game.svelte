<script lang="ts">
  import Board from "./Board.svelte";
  import ChessPiece from "./ChessPiece.svelte";
  import GhostMove from "./GhostMove.svelte";
  import { onMount } from "svelte";
  import { getGameContext } from "../context";
  import type Player from "$lib/models/player";
  import {
    declareDraw,
    declareWinner,
    displayPromotionDialog,
  } from "$lib/controllers/utils/dialog-utils";
  import type { Piece } from "$lib/models/pieces";
  import type Move from "$lib/models/move";
  import {
    capturedPiece,
    capturedBlackPieces,
    capturedWhitePieces,
    promotedPieceType,
    moveList,
    isUndoMove,
  } from "$lib/store";
  import { promote } from "$lib/models/pieces";
  import type { BaseMove } from "$lib/models/move";

  const ctx = getGameContext();
  $: game = $ctx.game;
  $: eventBus = game.eventBus;
  $: Object.assign(window, { game });

  let rotate: boolean = false;
  let activeColor: string = "White";

  let turn: HTMLElement;
  let endGameDialog: HTMLDialogElement;
  let promotionDialog: HTMLDialogElement;
  let undoDialog: HTMLDialogElement;
  let reviewDialog: HTMLDialogElement;

  let whitePieces: HTMLElement;
  let blackPieces: HTMLElement;

  onMount(() => {
    eventBus.addEventListener("move", handlePieceMove);
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
      eventBus.removeEventListener("move", handlePieceMove);
    };
  });

  function handlePieceClick(piece: Piece) {
    if (piece.color !== activeColor) {
    } else {
      if (selectedPiece === piece) {
        selectedPiece = null;
      } else {
        selectedPiece = piece;
      }
    }
  }

  let movesList: Move[] = [];

  let selectedPiece: Piece | null;
  let ghostMove: Move[];

  let blackCapturedPieces: Piece[] = [];
  let whiteCapturedPieces: Piece[] = [];

  $: ghostMoves = selectedPiece ? game.getMoves(selectedPiece) : [];

  $: if ($isUndoMove) {
    const activePlayer = game.getActivePlayer();
    updatePlayerTurnAndText(activePlayer);
    activeColor = activePlayer.color;

    $isUndoMove = false;
  }

  function handlePieceMove(event: CustomEvent) {
    handleMove();
    updateMovesList(event);

    if (event.detail.move.capturedPiece) {
      handlePieceCapture(event);
    }
  }

  function handleMove() {
    const activePlayer = game.getActivePlayer();
    checkForTerminalState(activePlayer);
    updatePlayerTurnAndText(activePlayer);
  }

  function updateMovesList(event: CustomEvent) {
    $moveList = [...$moveList, event.detail.move];
  }

  function checkForTerminalState(activePlayer: Player) {
    const color = activePlayer.color;
    if (activePlayer.opponent.moves.length === 0) {
      setTimeout(() => {
        if (game.isPlayerInCheck()) {
          const checkmate = `Checkmate! ${color} player wins!`;
          declareWinner(color, game, checkmate);
        } else {
          const stalemate = "Stalemate";
          declareDraw(game, stalemate, false);
        }
      }, 500);
    }
  }

  function updatePlayerTurnAndText(activePlayer: Player) {
    rotateBoard(activePlayer);
    turn.textContent = `${activePlayer.opponent.color}'s Turn`;
  }

  function handlePieceCapture(event: CustomEvent) {
    const capturedPiece = event.detail.move.capturedPiece;
    $ctx = $ctx;
    $capturedPiece = capturedPiece;
    if (capturedPiece.player.color === "Black") {
      blackCapturedPieces = [...blackCapturedPieces, capturedPiece];
      $capturedBlackPieces = blackCapturedPieces;
    } else {
      whiteCapturedPieces = [...whiteCapturedPieces, capturedPiece];
      $capturedWhitePieces = whiteCapturedPieces;
    }

    game = game;
  }

  function activateMoveListBtns() {
    // movesList.importButton.addEventListener("click", () => {
    //   movesList.fileInput.click();
    // });
    // movesList.fileInput.addEventListener("change", (event) => {
    //   const reader = new FileReader();
    //   reader.onload = (event) => {
    //     loading = true;
    //     cleanup();
    //     // game = new Game(eventBus);
    //     initializeGame();
    //     const pgn = event.target.result;
    //     const parsedPgn = parsePgn(pgn);
    //     game.fromParsedToken(parsedPgn);
    //     loading = false;
    //   };
    //   reader.readAsText(event.target.files[0]);
    // });
  }

  // function activateDialongBtns() {
  //   promotionDialog.pieceSelect.addEventListener("change", (event) => {
  //     event.preventDefault();
  //     promotionDialog.acceptButton.value = promotionDialog.pieceSelect.value;
  //   });
  // }

  function rotateBoard(activePlayer: Player) {
    if (activePlayer !== game.whitePlayer) {
      rotate = true;
    } else {
      rotate = false;
    }
  }

  async function handleGhostMove(event: CustomEvent<BaseMove>) {
    if ($promotedPieceType) {
      game = game
      $promotedPieceType = null;
    }

    const move = event.detail;

    if (move.isPromotion) {
      const chosenPromotionPiece = await displayPromotionDialog();
      const promotedPiece = promote(move, chosenPromotionPiece);
      move.pieceToPromoteTo = promotedPiece;
      $promotedPieceType = promotedPiece;
      game.doMove(move);
      game = game;
    } else {
      game.doMove(move);
    }

    const activePlayer = game.getActivePlayer();
    selectedPiece = null;
    activeColor = activePlayer.color;
    rotateBoard(activePlayer);
  }
</script>

<Board {rotate} board={game.board} let:row let:file>
  {@const piece = game.board.get(row, file)}
  {#if piece}
    <ChessPiece
      {piece}
      active={piece === selectedPiece}
      on:click={() => handlePieceClick(piece)}
      captured={false}
    />
  {/if}

  {#each ghostMoves as ghostMove}
    {@const piece = game.board.getSquareContent(row, file)}
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
