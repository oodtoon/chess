import Game from "../game.js";

describe("king", () => {
  test("no moves on start", () => {
    const game = new Game();
    const whiteKing = game.board.get(0, 4);
    const blackKing = game.board.get(7, 4);
    expect(
      game.getMoves(whiteKing).map((move) => [move.row, move.file])
    ).toEqual([]);
    expect(
      game.getMoves(blackKing).map((move) => [move.row, move.file])
    ).toEqual([]);
  });

  test("king moves", () => {
    const game = new Game();
    const whiteKing = game.board.get(0, 4);
    const blackKing = game.board.get(7, 4);
    const WPL = game.board.get(1, 3);
    const WPC = game.board.get(1, 4);
    const WPR = game.board.get(1, 5);
    const BPL = game.board.get(6, 3);
    const BPC = game.board.get(6, 4);
    const BPR = game.board.get(6, 5);

    game.doMove(game.getMoves(WPL)[1]);
    game.doMove(game.getMoves(BPL)[1]);
    game.doMove(game.getMoves(WPC)[1]);
    game.doMove(game.getMoves(BPC)[1]);
    game.doMove(game.getMoves(WPR)[1]);
    game.doMove(game.getMoves(BPR)[1]);

    expect(
      game.getMoves(whiteKing).map((move) => [move.row, move.file])
    ).toEqual([
      [1, 3],
      [1, 5],
      [1, 4],
    ]);
    expect(
      game.getMoves(blackKing).map((move) => [move.row, move.file])
    ).toEqual([
      [6, 3],
      [6, 5],
      [6, 4],
    ]);
  });

  test("king in check", () => {
    const game = new Game();
    const whiteKing = game.board.get(0, 4);
    const blackKing = game.board.get(7, 4);
    const blackQueen = game.board.get(7, 3);
    const WPL = game.board.get(1, 3);
    const WPC = game.board.get(1, 4);
    const WPR = game.board.get(1, 5);
    const BPL = game.board.get(6, 3);
    const BPC = game.board.get(6, 4);
    const BPR = game.board.get(6, 5);

    game.doMove(game.getMoves(WPL)[1]);
    game.doMove(game.getMoves(BPL)[1]);
    game.doMove(game.getMoves(WPC)[1]);
    game.doMove(game.getMoves(BPC)[1]);
    game.doMove(game.getMoves(WPR)[1]);
    game.doMove(game.getMoves(BPR)[1]);
    game.doMove(game.getMoves(blackQueen)[3]);

    expect(whiteKing.isChecked).toBe(true);
    expect(blackKing.isChecked).toBe(false);
  });

  // test("can castle", () => {
  //   const game = new Game();
  //   const whiteKing = game.board.get(0, 4);
  //   const blackKing = game.board.get(7, 4);
  //   const blackQueen = game.board.get(7, 3)
  //   const WPR = game.board.get(1, 5);
  //   const WPC = game.board.get(1, 4);
  //   const WPRR = game.board.get(1, 6);
  //   const BPL = game.board.get(6, 3);
  //   const BPLLL = game.board.get(6, 1);
  //   const BPLL = game.board.get(6, 2);

  //   game.doMove(game.getMoves(WPC)[0]);
  //   game.doMove(game.getMoves(BPL)[0]);
  //   game.doMove(game.getMoves(WPR)[1]);
  //   game.doMove(game.getMoves(BPLL)[1]);
  //   game.doMove(game.getMoves(WPRR)[0]);
  //   game.doMove(game.getMoves(BPLLL)[0]);
  //   game.doMove(game.getMoves(blackQueen)[3]);

  // })
});
