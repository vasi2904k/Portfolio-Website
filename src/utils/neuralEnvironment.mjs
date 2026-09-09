// Deterministic tissue: two loose hemispheres, branching dendrites, axons and
// a much larger distant field. Coordinates are world-space, never camera-bound.
export function createNeuralEnvironment(quality, seed = 419) {
  let value = seed;
  const random = () => { value = (Math.imul(value, 1664525) + 1013904223) >>> 0; return value / 4294967296; };
  const between = (a, b) => a + random() * (b - a);
  const centers = [], fibers = [], phases = [], paths = [], fieldPositions = [], fieldEdges = [], dust = [], clouds = [];
  const normalize = vector => { const length = Math.hypot(...vector) || 1; return vector.map(v => v / length); };
  function curve(from, to, phase, bend = 1) {
    const steps = 8, path = new Float32Array((steps + 1) * 3);
    const mid = from.map((v, axis) => (v + to[axis]) / 2 + between(-bend, bend));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps, s = 1 - t;
      for (let axis = 0; axis < 3; axis++) path[i * 3 + axis] = s * s * from[axis] + 2 * s * t * mid[axis] + t * t * to[axis];
      if (i > 0) { fibers.push(...path.subarray((i - 1) * 3, (i + 1) * 3)); phases.push(phase, phase); }
    }
    paths.push({ points: path, phase, center: mid });
  }
  function dendrite(start, direction, length, depth, phase) {
    const end = start.map((v, axis) => v + direction[axis] * length);
    curve(start, end, phase, length * .24);
    if (depth <= 0) return;
    for (let fork = 0; fork < 2; fork++) {
      const next = normalize(direction.map(v => v + between(-.75, .75)));
      dendrite(end, next, length * between(.52, .72), depth - 1, phase);
    }
  }
  for (let i = 0; i < quality.clusters; i++) {
    const side = i % 2 ? 1 : -1;
    const theta = i * 2.39996323, radial = between(.6, 1);
    // The cleft between hemispheres leaves breathing room for the navigation.
    const center = [side * (16 + Math.abs(Math.cos(theta)) * 31 * radial) * quality.spread, Math.sin(theta) * 28 * radial, between(-80, 8)];
    const phase = between(0, Math.PI * 2), radius = between(.2, .48);
    centers.push({ position: center, phase, radius });
    for (let arm = 0; arm < 5; arm++) {
      const angle = arm * Math.PI * 2 / 5 + phase;
      dendrite(center, normalize([Math.cos(angle), Math.sin(angle), between(-.75, .75)]), between(2.8, 5.8), quality.dendriteDepth, phase);
    }
  }
  // Long axons connect nearby clusters, giving the tissue a readable structure.
  for (let i = 0; i < centers.length; i++) {
    let nearest = -1, distance = Infinity;
    for (let j = i + 1; j < centers.length; j++) {
      const d = centers[i].position.reduce((sum, v, axis) => sum + (v - centers[j].position[axis]) ** 2, 0);
      if (d < distance) { distance = d; nearest = j; }
    }
    if (nearest >= 0) curve(centers[i].position, centers[nearest].position, centers[i].phase, 6);
  }
  for (let i = 0; i < quality.fieldNodes; i++) {
    const azimuth = between(0, Math.PI * 2), elevation = between(-1, 1), r = between(.6, 1.15);
    const ring = Math.sqrt(1 - elevation * elevation);
    fieldPositions.push(Math.cos(azimuth) * ring * 105 * r, elevation * 70 * r, Math.sin(azimuth) * ring * 100 * r - 65);
  }
  for (let i = 0; i < quality.fieldNodes; i++) {
    let nearest = -1, distance = 24 * 24;
    for (let j = i + 1; j < quality.fieldNodes; j++) {
      const dx = fieldPositions[i * 3] - fieldPositions[j * 3], dy = fieldPositions[i * 3 + 1] - fieldPositions[j * 3 + 1], dz = fieldPositions[i * 3 + 2] - fieldPositions[j * 3 + 2];
      const d = dx * dx + dy * dy + dz * dz;
      if (d < distance) { distance = d; nearest = j; }
    }
    if (nearest >= 0) fieldEdges.push(...fieldPositions.slice(i * 3, i * 3 + 3), ...fieldPositions.slice(nearest * 3, nearest * 3 + 3));
  }
  for (let i = 0; i < quality.dust; i++) dust.push(between(-65, 65), between(-40, 40), between(-85, 22));
  for (let i = 0; i < quality.mist; i++) clouds.push({ position: [between(-62, 62), between(-36, 36), between(-105, -14)], radius: between(9, 19) });
  return { centers, paths, fibers: new Float32Array(fibers), phases: new Float32Array(phases), fieldPositions: new Float32Array(fieldPositions), fieldEdges: new Float32Array(fieldEdges), dust: new Float32Array(dust), clouds };
}

export function closestNeuralPaths(paths, position, count = 16) {
  return paths.map((path, index) => ({ index, distance: path.center.reduce((sum, value, axis) => sum + (value - position[axis]) ** 2, 0) }))
    .sort((a, b) => a.distance - b.distance).slice(0, count).map(item => item.index);
}
