export function intToFile(value) {
  return String.fromCharCode("a".charCodeAt(0) + value);
}

export function fileToInt(value) {
  return value.charCodeAt(0) - "a".charCodeAt(0);
}

export function coordToAlgebraic(coord) {
  const [rank, file] = coord;

  return `${intToFile(file)}${rank + 1}`;
}

export function algebraicToCoord(algebraic) {
  return [fileToInt(algebraic[1]), -1 + algebraic[0]];
}
