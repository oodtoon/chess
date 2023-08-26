import { Schema, type, ArraySchema, MapSchema} from "@colyseus/schema";


export class PlayerMap extends Schema {
  constructor(color: string) {
    super();
    this.color = color;
  }

  @type("string") color: string;
}

export default class GameState extends Schema {

  @type({ array: "string" }) strMoves = new ArraySchema<string>();

  @type({ map: PlayerMap }) players = new MapSchema<PlayerMap>()
}

