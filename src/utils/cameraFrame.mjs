import { getFocusIds } from "./graphModel.mjs";

// CSS and camera share a reserved rectangle: header/breadcrumb above, travel
// below, content beside the graph (or a collapsible story on portrait mobile).
export function getGraphViewport(width, height, compact, panelExpanded = false) {
  if (compact) {
    const panelHeight = panelExpanded ? Math.max(155, height * .30) : 64;
    return { left: 18, right: width - 18, top: 126, bottom: Math.max(206, height - 151 - panelHeight - 18) };
  }
  const panelWidth = width >= 1700 ? 420 : width <= 1100 ? width * .32 : Math.min(380, width * .31);
  const panelRight = width >= 1700 ? 65 : width <= 1100 ? 25 : 38;
  return { left: 26, right: width - panelWidth - panelRight - 24, top: height <= 500 ? 108 : 145, bottom: height - (height <= 500 ? 91 : 148) };
}

export function calculateCameraFrame(graph, selectedId, width, height, compact, panelExpanded = false) {
  const center = graph.nodes[selectedId].position;
  const points = getFocusIds(graph, selectedId).map(id => graph.nodes[id].position);
  const rect = getGraphViewport(width, height, compact, panelExpanded);
  const aspect = width / Math.max(1, height), tan = Math.tan(44 * Math.PI / 360);
  const spanX = Math.max(...points.map(point => Math.abs(point[0] - center[0]))) + 1;
  const spanY = Math.max(...points.map(point => Math.abs(point[1] - center[1]))) + 1;
  const freeWidth = Math.max(.15, (rect.right - rect.left - 90) / width);
  const freeHeight = Math.max(.10, (rect.bottom - rect.top - 48) / height);
  const distance = Math.max(11, spanX / (tan * aspect * freeWidth), spanY / (tan * freeHeight));
  // The active neuron stays centered in the usable graph area, even for a
  // one-sided branch. An off-axis projection reserves room for the story.
  const ndcX = (rect.left + rect.right) / width - 1;
  const ndcY = 1 - (rect.top + rect.bottom) / height;
  return { x: center[0] - distance * tan * aspect * ndcX, y: center[1] - distance * tan * ndcY, z: center[2], distance };
}

export function isCameraFrameSafe(point, camera) {
  return [point.x, point.y, point.z, ...camera.position.toArray(), ...camera.quaternion.toArray()].every(Number.isFinite)
    && Math.abs(point.x) < .94 && Math.abs(point.y) < .88 && point.z > -1 && point.z < 1
    && Math.abs(camera.up.x) < .15 && camera.up.y > .9
    && Math.abs(camera.matrixWorld.elements[4]) < .2 && camera.matrixWorld.elements[5] > .85;
}
