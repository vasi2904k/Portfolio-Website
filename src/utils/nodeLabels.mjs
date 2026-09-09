const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const byHeight = (a, b) => a.desiredY - b.desiredY || a.desiredX - b.desiredX;

export function getLabelWidth(rect, count) {
  const rows = Math.max(1, Math.floor((rect.bottom - rect.top + 6) / 60));
  const columns = Math.max(3, Math.ceil(count / rows));
  return Math.min(132, Math.floor((rect.right - rect.left - (columns - 1) * 6) / columns));
}

// Mutates a small, cached array of projected labels. Prefer each neuron's own
// position; only crowded views use evenly spaced annotation slots. Leader
// lines keep displaced labels attached to their original 3D neurons.
export function arrangeNodeLabels(items, rect, width, height = 54) {
  const gap = 6, left = rect.left + width / 2, right = rect.right - width / 2;
  const top = rect.top + height / 2, bottom = rect.bottom - height / 2;
  for (const item of items) { item.x = clamp(item.desiredX, left, right); item.y = clamp(item.desiredY, top, bottom); }
  let collisions = false;
  for (let pass = 0; pass < 12; pass++) {
    collisions = false;
    for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
      const a = items[i], b = items[j], dx = b.x - a.x, dy = b.y - a.y;
      const overlapX = width + gap - Math.abs(dx), overlapY = height + gap - Math.abs(dy);
      if (overlapX <= 0 || overlapY <= 0) continue;
      collisions = true;
      if (overlapX < overlapY) {
        const shift = (overlapX + 1) * .5 * (dx >= 0 ? 1 : -1);
        a.x = clamp(a.x - shift, left, right); b.x = clamp(b.x + shift, left, right);
      } else {
        const shift = (overlapY + 1) * .5 * (dy >= 0 ? 1 : -1);
        a.y = clamp(a.y - shift, top, bottom); b.y = clamp(b.y + shift, top, bottom);
      }
    }
    if (!collisions) return;
  }
  const columns = Math.max(1, Math.min(items.length, Math.floor((rect.right - rect.left + gap) / (width + gap))));
  const rows = Math.ceil(items.length / columns);
  items.sort(byHeight);
  for (let i = 0; i < items.length; i++) {
    const row = Math.floor(i / columns), count = Math.min(columns, items.length - row * columns);
    items[i].x = (rect.left + rect.right) / 2 + (i % columns - (count - 1) / 2) * (width + gap);
    items[i].y = (rect.top + rect.bottom) / 2 + (row - (rows - 1) / 2) * (height + gap);
  }
}
