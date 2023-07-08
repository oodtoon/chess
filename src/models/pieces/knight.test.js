import Game from "../game.js";

describe("knight", () => {
  test("first available moves", () => {
    const game = new Game();
    const whiteKnight = game.board.get(0, 1);
    const blackKnight = game.board.get(7, 1);
    expect(
      game.getMoves(whiteKnight).map((move) => [move.row, move.file])
    ).toEqual([
      [2, 2],
      [2, 0],
    ]);
    expect(
      game.getMoves(blackKnight).map((move) => [move.row, move.file])
    ).toEqual([
      [5, 2],
      [5, 0],
    ]);
  });

  test("knight capture", () => {
    const game = new Game();
    const whiteKnight = game.board.get(0, 1);
    const blackKnight = game.board.get(7, 1);

    game.doMove(game.getMoves(whiteKnight)[0]);
    game.doMove(game.getMoves(blackKnight)[0]);
    game.doMove(game.getMoves(whiteKnight)[0]);
    game.doMove(game.getMoves(blackKnight)[2]);
    game.doMove(game.getMoves(whiteKnight)[5]);

    expect(game.blackPlayer.capturedPieceMap.Knight.length).toBe(1);
    expect(game.blackPlayer.livePieceMap.Knight.length).toBe(1);
    expect(game.blackPlayer.livePieces.length).toBe(15);
    expect(game.board.getSquareContent(3, 1).player.color).toBe("white");
  });
});
