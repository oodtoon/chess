import type { Square } from "./type";

export function intToFile(value: number) {
  return String.fromCharCode("a".charCodeAt(0) + value);
}

export function fileToInt(value: string) {
  return value.charCodeAt(0) - "a".charCodeAt(0);
}

export function coordToAlgebraic(coord: Square) {
  const [rank, file] = coord;

  return `${intToFile(file)}${rank + 1}`;
}

export function algebraicToCoord(algebraic: string) {
  return [fileToInt(algebraic[1]), -1 + algebraic[0]];
}
