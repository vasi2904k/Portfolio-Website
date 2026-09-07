export function connectionPoints(from, to, segments = 32) {
  const points = new Float32Array((segments + 1) * 3);
  const control = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2 + .32, (from[2] + to[2]) / 2 - .5];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments, s = 1 - t;
    for (let axis = 0; axis < 3; axis++) points[i * 3 + axis] = s * s * from[axis] + 2 * s * t * control[axis] + t * t * to[axis];
  }
  return points;
}
