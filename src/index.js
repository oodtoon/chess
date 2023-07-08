import ChessGameController from "./controllers/chess-game-controller.js";
import "./components/index.js";

//TESTING AREA

const controller = new ChessGameController("#main-game")
controller.initialize()