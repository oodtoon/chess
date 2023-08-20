<script lang="ts">
  import Board from "./Board.svelte";
  import ChessPiece from "./ChessPiece.svelte";
  import GhostMove from "./GhostMove.svelte";
  import { onMount } from "svelte";
  import { getGameContext } from "../context";
  import type Player from "$lib/models/player";
  import {
    declareWinner,
    displayPromotionDialog,
  } from "$lib/controllers/utils/dialog-utils";
  import type { Piece } from "$lib/models/pieces";
  import type Move from "$lib/models/move";
  import {
    capturedPiece,
    capturedBlackPieces,
    capturedWhitePieces,
    promotedPieceType
  } from "$lib/store";
  import { promote } from "$lib/models/pieces";

  const ctx = getGameContext();
  let { game } = $ctx;
  const { eventBus } = game;
  $: window.game = game;

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

    whitePieces = document.getElementById("White-pieces") as HTMLElement;
    blackPieces = document.getElementById("Black-pieces") as HTMLElement;

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

  let selectedPiece: Piece | null;
  let ghostMove: Move[];

  let blackCapturedPieces: Piece[] = [];
  let whiteCapturedPieces: Piece[] = [];

  $: ghostMoves = selectedPiece ? game.getMoves(selectedPiece) : [];

  function handlePieceMove(event: CustomEvent) {
    handleMove();
    // updateMovesList(event);
   
    if (event.detail.move.capturedPiece) {
      handlePieceCapture(event);
    }
  }

  function handleMove() {
    const activePlayer = game.getActivePlayer();
    checkForTerminalState(activePlayer);
    updatePlayerTurnAndText(activePlayer);
  }

  function handleUndoMove() {
    const prevMove = game.lastMove;

    if (prevMove.isCompoundMove) {
      for (const move of prevMove) {
        movePiece(move, true);
        game.undoMove();
      }
    } else {
      movePiece(prevMove, true);
    }

    if (prevMove.capturedPiece) {
      undoPieceCapture(prevMove);
    }

    const piece = prevMove.initiatingPiece;

    if (
      piece.name === "Pawn" ||
      piece.name === "Rook" ||
      piece.name === "King"
    ) {
      if (
        !game.moves.find((move) => {
          return move.initiatingPiece === piece;
        })
      ) {
        piece.hasMoved = false;
      }
    }

    game.undoMove();
    movesList.removeMove();
    const prevPlayer = game.getActivePlayer().opponent;
    updatePlayerTurnAndText(prevPlayer);
  }

  function updateMovesList(event) {
    if (movesList.currentListItem.children.length === 2) {
      movesList.nextListItem();
    }
    movesList.addMove(event.detail.move.toString());
  }

  function checkForTerminalState(activePlayer: Player) {
    const color = activePlayer.color;
    if (activePlayer.opponent.moves.length === 0) {
      setTimeout(() => {
        if (game.isPlayerInCheck()) {
          const checkmate = `Checkmate! ${color} player wins!`;
          declareWinner(color, game, turn, endGameDialog, checkmate);
        } else {
          const stalemate = "Stalemate";
          // declareDraw(game, endGameDialog, stalemate);
        }
        // movesList.setResult(game.result);
      }, 500);
    }
  }

  function updatePlayerTurnAndText(activePlayer) {
    rotateBoard(activePlayer);
    turn.textContent = `${activePlayer.opponent.color}'s Turn`;
  }


  function handlePieceCapture(event) {
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

  function undoPieceCapture(move) {
    const zombiePiece = move.capturedPiece;
    mountSinglePiece(zombiePiece);
    //const capturedPieceBin = getPlayerCapturePool(zombiePiece.player);
    const zombieElement = capturedPieceBin.lastChild;
    capturedPieceBin.removeChild(zombieElement);
  }

  function activateGameButtons() {
    gameButtons.drawButton.addEventListener("click", () => {
      const activePlayer = game.getActivePlayer();
      const color = activePlayer.color;
      const opponentColor = activePlayer.opponent.color;

      const drawMsg = `${color} wishes to draw. ${opponentColor}, do you accept?`;

      displayReviewDialog(reviewDialog, drawMsg, "Draw");
    });

    gameButtons.resignButton.addEventListener("click", () => {
      const activePlayer = game.getActivePlayer();
      const color = activePlayer.color;
      const opponentColor = activePlayer.opponent.color;
      const resignMsg = `${color} resigns. ${opponentColor} wins!`;
      declareWinner(color, game, turn, endGameDialog, resignMsg);
      movesList.setResult(game.result);
    });

    gameButtons.undoButton.addEventListener("click", (event) => {
      displayUndoMoveDialog(undoDialog);
    });
  }

  function activateMoveListBtns() {
    movesList.exportButton.addEventListener("click", () => {
      exportToPgn(game);
    });

    movesList.copyButton.addEventListener("click", () => {
      copyPgn(game);
    });

    movesList.importButton.addEventListener("click", () => {
      movesList.fileInput.click();
    });

    movesList.fileInput.addEventListener("change", (event) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        loading = true;
        cleanup();

        // game = new Game(eventBus);
        initializeGame();

        const pgn = event.target.result;
        const parsedPgn = parsePgn(pgn);
        game.fromParsedToken(parsedPgn);
        loading = false;
      };
      reader.readAsText(event.target.files[0]);
    });
  }

  function activateDialongBtns() {
    reviewDialog.acceptButton.addEventListener("click", () => {
      if (reviewDialog.type === "Draw") {
        game.result = "1/2-1/2";
        turn.textContent = "Draw";
        declareDraw(game, endGameDialog, "Draw", reviewDialog, movesList);
      } else {
        handleUndoMove();
        const dialog = reviewDialog.shadowRoot.getElementById("review-dialog");
        dialog.close();
      }
    });

    reviewDialog.declineButton.addEventListener("click", () => {
      closeDialog(reviewDialog);
    });

    undoDialog.requestButton.addEventListener("click", () => {
      const activePlayer = game.getActivePlayer();
      const color = activePlayer.opponent.color;
      const title = `${color} player wants to undo most recent move. Do you accept?`;
      displayReviewDialog(reviewDialog, title, "Undo move", true, undoDialog);
    });

    undoDialog.cancelButton.addEventListener("click", () => {
      closeDialog(undoDialog);
    });

    endGameDialog.playAgainButton.addEventListener("click", (event) => {
      const result = movesList?.shadowRoot?.querySelector(".result");
      result.remove();
      cleanup();

      // game = new Game(eventBus);
      initializeGame();

      const endDialog = endGameDialog.shadowRoot.getElementById("end-dialog");
      endDialog.close();
    });

    endGameDialog.exportButton.addEventListener("click", () => {
      exportToPgn(game);
    });

    endGameDialog.copyButton.addEventListener("click", () => {
      copyPgn(game);
    });

    promotionDialog.pieceSelect.addEventListener("change", (event) => {
      event.preventDefault();
      promotionDialog.acceptButton.value = promotionDialog.pieceSelect.value;
    });
  }

  function rotateBoard(activePlayer) {
    if (activePlayer !== game.whitePlayer) {
      rotate = true;
    } else {
      rotate = false;
    }
  }

  async function handleGhostMove(event: CustomEvent<Move>) {
    if ($promotedPieceType) {
      $promotedPieceType = null
    }

    const move = event.detail;

    if (move.isCompoundMove) {
      for (const m of move.moves) {
        game.doMove(m, true)
      }
    } else {
      if (move.initiatingPiece.isPawn() && (move.row === 0 || move.row === 7)) {
      const chosenPromotionPiece = await displayPromotionDialog(
        promotionDialog
      );
      const promotedPiece = promote(move, chosenPromotionPiece);
      move.pieceToPromoteTo = promotedPiece;
      $promotedPieceType = promotedPiece
      game.doMove(move);
      game=game
    } else {
      game.doMove(move);
    }
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
