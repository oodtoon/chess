import Game from "../game.js";

describe("rook", () => {
  test("queen no moves on start", () => {
    const game = new Game();
    const whiteQueen = game.board.get(0, 3);
    const blackQueen = game.board.get(7, 3);
    expect(
      game.getMoves(whiteQueen).map((move) => [move.row, move.file])
    ).toEqual([]);
    expect(
      game.getMoves(blackQueen).map((move) => [move.row, move.file])
    ).toEqual([]);
  });

  test("get rook moves", () => {
    const game = new Game();
    const whiteQueen = game.board.get(0, 3);
    const blackQueen = game.board.get(7, 3);
    const whitePawn = game.board.get(1, 2);
    const blackPawn = game.board.get(6, 2);

    game.doMove(game.getMoves(whitePawn)[1]);
    game.doMove(game.getMoves(blackPawn)[1]);

    expect(
      game.getMoves(whiteQueen).map((move) => [move.row, move.file])
    ).toEqual([
      [1, 2],
      [2, 1],
      [3, 0],
    ]);
    expect(
      game.getMoves(blackQueen).map((move) => [move.row, move.file])
    ).toEqual([
      [6, 2],
      [5, 1],
      [4, 0],
    ]);
  });

  test("rook can get captured", () => {
    const game = new Game();

    const whiteQueen = game.board.get(0, 3);
    const blackQueen = game.board.get(7, 3);
    const whitePawn = game.board.get(1, 2);
    const blackPawn = game.board.get(6, 2);

    game.doMove(game.getMoves(whitePawn)[1]);
    game.doMove(game.getMoves(blackPawn)[1]);
    game.doMove(game.getMoves(whiteQueen)[2]);
    game.doMove(game.getMoves(blackQueen)[2]);
    game.doMove(game.getMoves(whiteQueen)[6]);

    expect(game.blackPlayer.capturedPieceMap.Queen.length).toBe(1);
    expect(game.blackPlayer.livePieceMap.Queen.length).toBe(0);
    expect(game.blackPlayer.livePieces.length).toBe(15);
    expect(game.board.getSquareContent(4, 0).player.color).toBe("white");
  });
});
