/**
 * Import your Room files
 */
import { OnlineRoom } from "./rooms/OnlineRoom";
import { LocalRoom } from "./rooms/LocalRoom";

import { Server } from "colyseus";
import { createServer } from "http";
import express from "express";

const port = Number(process.env.port) || 2567;

const app = express();
app.use(express.json());

const gameServer = new Server({
  server: createServer(app)
});

gameServer.define('online_room', OnlineRoom);
gameServer.define('local_room', LocalRoom)

gameServer.listen(port);