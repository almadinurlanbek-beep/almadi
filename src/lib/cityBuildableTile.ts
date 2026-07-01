export const getBuildableTile = (
  tile: { x: number; y: number },
  isBlocked: (x: number, y: number) => boolean,
) => {
  if (!isBlocked(tile.x, tile.y)) return tile;
  for (let distance = 1; distance <= 4; distance += 1) {
    for (let dx = -distance; dx <= distance; dx += 1) {
      for (let dy = -distance; dy <= distance; dy += 1) {
        const next = { x: tile.x + dx, y: tile.y + dy };
        if (!isBlocked(next.x, next.y)) return next;
      }
    }
  }
  return tile;
};
