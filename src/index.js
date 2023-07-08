"use strict";

import Game from "./game.js";
import "./components/index.js";

//TESTING AREA

const game = new Game();

const whiteKing = game.board.get(0, 4);
const blackKing = game.board.get(7, 4);
const blackQueen = game.board.get(7, 3);
const WPR = game.board.get(1, 5);
const WPC = game.board.get(1, 4);
const WPRR = game.board.get(1, 6);
const BPL = game.board.get(6, 3);
const BPLLL = game.board.get(6, 1);
const BPLL = game.board.get(6, 2);
const WK = game.board.get(0, 6);
const BK = game.board.get(7, 1);
const WB = game.board.get(0, 5);
const BB = game.board.get(7, 2);

// game.doMove(game.getMoves(WPC)[0]);
// game.doMove(game.getMoves(BPL)[0]);
// game.doMove(game.getMoves(WPR)[1]);
// game.doMove(game.getMoves(BPLL)[1]);
// game.doMove(game.getMoves(WPRR)[0]);
// game.doMove(game.getMoves(BPLLL)[0]);
// game.doMove(game.getMoves(WK)[1]);
// game.doMove(game.getMoves(BK)[0]);
// game.doMove(game.getMoves(WB)[0]);
// game.doMove(game.getMoves(BB)[0]);
// game.doMove(game.getMoves(WPC)[0]);
// game.doMove(game.getMoves(blackQueen)[1]);
// game.doMove(game.getMoves(whiteKing)[2]);
// game.doMove(game.getMoves(blackKing)[1]);

//game.doMove(game.getMoves(WPLLL)[0])

console.log(whiteKing);
console.log(blackKing);

// const whitePawn = game.board.get(1, 1);
// const blackPawn = game.board.get(6, 0);
// const wp2 = game.board.get(1, 7);

// game.doMove(game.getMoves(blackPawn)[1]);
// game.doMove(game.getMoves(wp2)[0]);
// game.doMove(game.getMoves(blackPawn)[0]);
// game.doMove(game.getMoves(whitePawn)[1]);
// game.doMove(game.getMoves(blackPawn)[1]);

console.log(game.board.debug());

console.log(game.blackPlayer);
console.log(game.whitePlayer);
