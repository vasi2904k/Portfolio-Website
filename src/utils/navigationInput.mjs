// A wheel burst produces at most one transaction, including momentum that
// outlasts an animation. A quiet gap starts a new gesture.
export function createWheelGesture() { return { value: 0, lastEvent: -Infinity, fired: false }; }
export function consumeWheel(gesture, delta, now, locked, deltaMode = 0, height = 800) {
  if (now - gesture.lastEvent > 240) { gesture.value = 0; gesture.fired = false; }
  gesture.lastEvent = now;
  if (locked) { gesture.value = 0; gesture.fired = true; return 0; }
  if (gesture.fired || !Number.isFinite(delta)) return 0;
  const pixels = delta * (deltaMode === 1 ? 16 : deltaMode === 2 ? height : 1);
  if (Math.sign(pixels) !== Math.sign(gesture.value)) gesture.value = 0;
  gesture.value += Math.max(-120, Math.min(120, pixels));
  if (Math.abs(gesture.value) < 90) return 0;
  gesture.fired = true;
  return Math.sign(gesture.value);
}

export function classifyTouch(dx, dy, duration, maxDistance, cancelled = false) {
  if (cancelled) return "cancel";
  if (maxDistance <= 10 && duration < 650) return "tap";
  if (duration < 1000 && Math.abs(dy) >= 64 && Math.abs(dy) > Math.abs(dx) * 1.4) return dy < 0 ? "forward" : "back";
  return "drag";
}

export function cycleAvailable(ids, current, direction) {
  if (!ids.length) return null;
  const index = ids.indexOf(current);
  return ids[(index + direction + ids.length) % ids.length];
}
