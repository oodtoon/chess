
export function getUndoTitle(color: string) {
  const opposingPlayer = color === "White" ? "Black" : "White";
  return (
    `${color} requests to undo last move.` +
    "\n" +
    `${opposingPlayer}, do you accept their plea?`
  );
}



