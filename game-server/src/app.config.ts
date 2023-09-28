/**
 * Import your Room files
 */
import { OnlineRoom } from "./rooms/OnlineRoom";
import { LocalRoom } from "./rooms/LocalRoom";

import { Server } from "colyseus";
import { RedisPresence } from "@colyseus/redis-presence";
import { RedisDriver } from "@colyseus/redis-driver";
import { createServer } from "http";
import express from "express";
import cors from "cors";

type Constructor<K> = K extends { new: infer T } ? T : any;
type RedisArg = Parameters<Constructor<RedisDriver>>[0];

const port = Number(process.env.port) || 2567;

const app = express();

app.use(express.json());
app.use(cors());

const gameServer = new Server({
  server: createServer(app),
  presence: new RedisPresence(
    process.env.REDIS_SECRET as RedisArg
  ),
  driver: new RedisDriver(
    process.env.REDIS_SECRET as RedisArg
  ),
});

gameServer.define("online_room", OnlineRoom);
gameServer.define("local_room", LocalRoom);

gameServer.listen(port);
