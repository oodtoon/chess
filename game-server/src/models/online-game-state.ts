import { Schema, type, ArraySchema, MapSchema } from "@colyseus/schema";

export class Player extends Schema {
  constructor(color: string) {
    super();
    this.color = color;
  }

  @type("string") color: string;
  @type("boolean") connected = true;
}

class RequestState extends Schema {
  @type("boolean") hasRequest: boolean = false;
  @type("string") type: string = "";
  @type("string") title: string = "";
  @type("string") content: string = "";
  @type("string") playerColor: string = ""
}

export default class GameState extends Schema {
  @type({ array: "string" }) strMoves = new ArraySchema<string>();
  @type({ map: Player }) players = new MapSchema<Player>();
  @type(RequestState) requestState: RequestState = new RequestState();
  @type("number") minutes: number = 0
  @type("number") moveTime: number = 0
  @type("number") whiteClock: number = 0
  @type("number") blackClock: number = 0
}
