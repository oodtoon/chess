import Game from "../game.js";

describe("bishop", () => {
  test("no moves to start", () => {
    const game = new Game();
    const whiteBishop = game.board.get(0, 2);
    const blackBishop = game.board.get(7, 2);
    expect(
      game.getMoves(whiteBishop).map((move) => [move.row, move.file])
    ).toEqual([]);
    expect(
      game.getMoves(blackBishop).map((move) => [move.row, move.file])
    ).toEqual([]);
  });

  test("get moves", () => {
    const game = new Game();
    const whiteBishop = game.board.get(0, 2);
    const blackBishop = game.board.get(7, 2);

    const whitePawnL = game.board.get(1, 1);
    const blackPawnL = game.board.get(6, 1);
    const whitePawnR = game.board.get(1, 3);
    const blackPawnR = game.board.get(6, 3);

    game.doMove(game.getMoves(blackPawnL)[0]);
    game.doMove(game.getMoves(whitePawnL)[0]);
    game.doMove(game.getMoves(blackPawnR)[0]);
    game.doMove(game.getMoves(whitePawnR)[1]);

    expect(
      game.getMoves(whiteBishop).map((move) => [move.row, move.file])
    ).toEqual([
      [1, 1],
      [2, 0],
      [1, 3],
      [2, 4],
      [3, 5],
      [4, 6],
      [5, 7],
    ]);
    expect(
      game.getMoves(blackBishop).map((move) => [move.row, move.file])
    ).toEqual([
      [6, 1],
      [5, 0],
      [6, 3],
      [5, 4],
      [4, 5],
      [3, 6],
      [2, 7],
    ]);
  });

  test("bishop captures piece", () => {
    const game = new Game();
    const whiteBishop = game.board.get(0, 2);
    const blackBishop = game.board.get(7, 2);

    const whitePawnL = game.board.get(1, 1);
    const blackPawnL = game.board.get(6, 1);
    const whitePawnR = game.board.get(1, 3);
    const blackPawnR = game.board.get(6, 3);

    game.doMove(game.getMoves(whitePawnL)[0]);
    game.doMove(game.getMoves(blackPawnL)[0]);
    game.doMove(game.getMoves(whitePawnR)[0]);
    game.doMove(game.getMoves(blackPawnR)[0]);
    game.doMove(game.getMoves(whiteBishop)[1]);
    game.doMove(game.getMoves(blackBishop)[1]);
    game.doMove(game.getMoves(whiteBishop)[4]);
    game.doMove(game.getMoves(blackBishop)[2]);

    expect(game.whitePlayer.livePieces.length).toBe(15);
    expect(game.whitePlayer.livePieceMap.Pawn.length).toBe(7);
    expect(game.whitePlayer.capturedPieceMap.Pawn.length).toBe(1);
    expect(game.blackPlayer.livePieces.length).toBe(15);
    expect(game.blackPlayer.livePieceMap.Pawn.length).toBe(7);
    expect(game.blackPlayer.capturedPieceMap.Pawn.length).toBe(1);
  });

  test("bishop can get captured", () => {
    const game = new Game();
    const whiteBishop = game.board.get(0, 2);
    const blackBishop = game.board.get(7, 5);

    const whitePawnL = game.board.get(1, 1);
    const blackPawnL = game.board.get(6, 4);

    game.doMove(game.getMoves(whitePawnL)[0]);
    game.doMove(game.getMoves(blackPawnL)[0]);
    game.doMove(game.getMoves(whiteBishop)[1]);
    game.doMove(game.getMoves(blackBishop)[4]);

    expect(game.whitePlayer.capturedPieceMap.Bishop.length).toBe(1);
    expect(game.whitePlayer.livePieceMap.Bishop.length).toBe(1);
    expect(game.whitePlayer.livePieces.length).toBe(15);
    expect(game.board.getSquareContent(2, 0).player.color).toBe("Black");
  });
});
