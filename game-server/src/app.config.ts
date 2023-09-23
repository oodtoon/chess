/**
 * Import your Room files
 */
import { OnlineRoom } from "./rooms/OnlineRoom";
import { LocalRoom } from "./rooms/LocalRoom";

import { RedisDriver, RedisPresence, Server } from "colyseus";
import { createServer } from "http";
import express from "express";
import cors from "cors"

const port = Number(process.env.port) || 2567;

const app = express();

app.use(express.json());
app.use(cors())

const gameServer = new Server({
  server: createServer(app),
});

gameServer.define("online_room", OnlineRoom);
gameServer.define("local_room", LocalRoom);

gameServer.listen(port);

