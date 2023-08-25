
type Color = "White" | "Black";
export default Color;


export type EndGameTitle =
  | "Draw!"
  | "White wins!"
  | "Black wins!"
  | "Stalemate!";

export type Square = [number, number]
