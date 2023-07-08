import Game from "../game.js";

describe("pawn", () => {
  test("get moves", () => {
    const game = new Game();
    const whitePawn = game.board.get(1, 0);
    const blackPawn = game.board.get(6, 0);
    expect(
      game.getMoves(whitePawn).map((move) => [move.row, move.file])
    ).toEqual([
      [2, 0],
      [3, 0],
    ]);
    expect(
      game.getMoves(blackPawn).map((move) => [move.row, move.file])
    ).toEqual([
      [5, 0],
      [4, 0],
    ]);
  });

  test("get moves after move", () => {
    const game = new Game();
    const whitePawn = game.board.get(1, 0);
    const blackPawn = game.board.get(6, 0);

    game.doMove(game.getMoves(whitePawn)[0]);
    game.doMove(game.getMoves(blackPawn)[0]);

    expect(
      game.getMoves(whitePawn).map((move) => [move.row, move.file])
    ).toEqual([[3, 0]]);
    expect(
      game.getMoves(blackPawn).map((move) => [move.row, move.file])
    ).toEqual([[4, 0]]);
  });

  test("show no moves with piece ahead", () => {
    const game = new Game();
    const whitePawn = game.board.get(1, 0);
    const blackPawn = game.board.get(6, 0);

    game.doMove(game.getMoves(whitePawn)[1]);
    game.doMove(game.getMoves(blackPawn)[1]);

    expect(
      game.getMoves(whitePawn).map((move) => [move.row, move.file])
    ).toEqual([]);
    expect(
      game.getMoves(blackPawn).map((move) => [move.row, move.file])
    ).toEqual([]);
  });

  test("get attack moves", () => {
    const game = new Game();
    const whitePawn = game.board.get(1, 1);
    const blackPawn = game.board.get(6, 0);

    game.doMove(game.getMoves(whitePawn)[1]);
    game.doMove(game.getMoves(blackPawn)[1]);

    expect(
      game.getMoves(whitePawn).map((move) => [move.row, move.file])
    ).toEqual([
      [4, 1],
      [4, 0],
    ]);
    expect(
      game.getMoves(blackPawn).map((move) => [move.row, move.file])
    ).toEqual([
      [3, 0],
      [3, 1],
    ]);
  });

  test("can en passant", () => {
    const game = new Game();
    const whitePawn = game.board.get(1, 1);
    const blackPawn = game.board.get(6, 0);
    const wp2 = game.board.get(1, 7);

    game.doMove(game.getMoves(blackPawn)[1]);
    game.doMove(game.getMoves(wp2)[0]);
    game.doMove(game.getMoves(blackPawn)[0]);
    game.doMove(game.getMoves(whitePawn)[1]);

    expect(
      game.getMoves(blackPawn).map((move) => [move.row, move.file])
    ).toEqual([
      [2, 0],
      [2, 1],
    ]);
  });

  test("en passant success", () => {
    const game = new Game();
    const whitePawn = game.board.get(1, 1);
    const blackPawn = game.board.get(6, 0);
    const wp2 = game.board.get(1, 7);
    const wp0 = game.board.get(1, 0);

    game.doMove(game.getMoves(blackPawn)[1]);
    game.doMove(game.getMoves(wp2)[0]);
    game.doMove(game.getMoves(blackPawn)[0]);
    game.doMove(game.getMoves(whitePawn)[1]);
    game.doMove(game.getMoves(blackPawn)[1]);

    expect(
      game.getMoves(blackPawn).map((move) => [move.row, move.file])
    ).toEqual([
      [1, 1],
      [1, 0],
      [1, 2],
    ]);
    expect(game.board.isSquareOccupied(3, 1)).toBe(false);
    expect(game.whitePlayer.livePieces.length).toBe(15);
    expect(game.whitePlayer.capturedPieceMap.Pawn.length).toBe(1);
    expect(game.getMoves(wp0).map((move) => [move.row, move.file])).toEqual([
      [2, 0],
      [3, 0],
      [2, 1],
    ]);
  });
});
