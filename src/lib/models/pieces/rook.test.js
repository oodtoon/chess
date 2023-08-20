import Game from "../game.js";

describe("rook", () => {
  test("rook no moves on start", () => {
    const game = new Game();
    const whiteRook = game.board.get(0, 0);
    const blackRook = game.board.get(7, 0);
    expect(
      game.getMoves(whiteRook).map((move) => [move.row, move.file])
    ).toEqual([]);
    expect(
      game.getMoves(blackRook).map((move) => [move.row, move.file])
    ).toEqual([]);
  });

  test("get rook moves", () => {
    const game = new Game();
    const whiteRook = game.board.get(0, 0);
    const blackRook = game.board.get(7, 0);
    const whitePawn = game.board.get(1, 0);
    const blackPawn = game.board.get(6, 0);

    game.doMove(game.getMoves(whitePawn)[1]);
    game.doMove(game.getMoves(blackPawn)[1]);
    game.doMove(game.getMoves(whiteRook)[1]);
    game.doMove(game.getMoves(blackRook)[1]);

    expect(
      game.getMoves(whiteRook).map((move) => [move.row, move.file])
    ).toEqual([
      [1, 0],
      [0, 0],
      [2, 1],
      [2, 2],
      [2, 3],
      [2, 4],
      [2, 5],
      [2, 6],
      [2, 7],
    ]);
    expect(
      game.getMoves(blackRook).map((move) => [move.row, move.file])
    ).toEqual([
      [6, 0],
      [7, 0],
      [5, 1],
      [5, 2],
      [5, 3],
      [5, 4],
      [5, 5],
      [5, 6],
      [5, 7],
    ]);
  });

  test("rook can get captured", () => {
    const game = new Game();
    const whiteRook = game.board.get(0, 0);
    const blackRook = game.board.get(7, 0);
    const whitePawn = game.board.get(1, 0);
    const blackPawn = game.board.get(6, 0);

    game.doMove(game.getMoves(whitePawn)[1]);
    game.doMove(game.getMoves(blackPawn)[1]);
    game.doMove(game.getMoves(whiteRook)[1]);
    game.doMove(game.getMoves(blackRook)[1]);
    game.doMove(game.getMoves(whiteRook)[2]);
    game.doMove(game.getMoves(blackRook)[2]);
    game.doMove(game.getMoves(whiteRook)[2]);

    expect(game.blackPlayer.capturedPieceMap.Rook.length).toBe(1);
    expect(game.blackPlayer.livePieceMap.Rook.length).toBe(1);
    expect(game.blackPlayer.livePieces.length).toBe(15);
    expect(game.board.getSquareContent(5, 1).player.color).toBe("White");
  });
});
