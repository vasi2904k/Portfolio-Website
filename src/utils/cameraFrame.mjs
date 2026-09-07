import { getFocusIds } from "./graphModel.mjs";

export function calculateCameraFrame(graph, selectedId, width, height, compact) {
  const points = getFocusIds(graph, selectedId).map(id => graph.nodes[id].position);
  const min = [0, 1, 2].map(axis => Math.min(...points.map(point => point[axis])));
  const max = [0, 1, 2].map(axis => Math.max(...points.map(point => point[axis])));
  const center = min.map((value, axis) => (value + max[axis]) / 2);
  const aspect = width / Math.max(1, height), tan = Math.tan(44 * Math.PI / 360);
  const freeWidth = compact ? .9 : Math.max(.48, 1 - Math.min(410, width * .31) / width - .13);
  const freeHeight = compact ? .39 : height < 600 ? .51 : .69;
  const distance = Math.max(compact ? 10 : 11, (max[0] - min[0] + 2.8) / (2 * tan * aspect * freeWidth), (max[1] - min[1] + 2.6) / (2 * tan * freeHeight)) + (max[2] - min[2]) * .4;
  // Shift the graph into the free rectangle beside/above the content output.
  const panelShiftX = compact ? 0 : distance * tan * aspect * .29;
  const panelShiftY = compact ? -distance * tan * .36 : 0;
  return { x: center[0] + panelShiftX, y: center[1] + panelShiftY, z: center[2], distance };
}

