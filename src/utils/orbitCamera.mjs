import { MOUSE, TOUCH } from "three";
import { calculateCameraFrame, getGraphViewport } from "./cameraFrame.mjs";

export function getOrbitFrame(graph, id, width, height, compact, panelExpanded) {
  const { distance } = calculateCameraFrame(graph, id, width, height, compact, panelExpanded);
  const target = graph.nodes[id].position;
  const rect = getGraphViewport(width, height, compact, panelExpanded);
  return { target, position: [target[0], target[1] + .3, target[2] + distance], distance,
    offsetX: (width - rect.left - rect.right) / 2, offsetY: (height - rect.top - rect.bottom) / 2 };
}

export function configureOrbit(controls, distance, mobile = false, reduced = false) {
  controls.enableDamping = !reduced; controls.dampingFactor = .085;
  controls.rotateSpeed = mobile ? .45 : .55; controls.zoomSpeed = .6; controls.panSpeed = .55;
  controls.minDistance = Math.max(6, distance * .58);
  controls.maxDistance = Math.max(controls.minDistance + 5, distance * 1.7);
  controls.minPolarAngle = Math.PI * (mobile ? .32 : .26);
  controls.maxPolarAngle = Math.PI * (mobile ? .68 : .74);
  controls.minAzimuthAngle = -Math.PI * (mobile ? .34 : .43);
  controls.maxAzimuthAngle = Math.PI * (mobile ? .34 : .43);
  controls.minTargetRadius = 0; controls.maxTargetRadius = Math.min(mobile ? 2 : 3, distance * .075);
  controls.screenSpacePanning = true; controls.zoomToCursor = false;
  controls.mouseButtons.LEFT = MOUSE.ROTATE; controls.mouseButtons.MIDDLE = MOUSE.DOLLY; controls.mouseButtons.RIGHT = MOUSE.PAN;
  controls.touches.ONE = TOUCH.ROTATE; controls.touches.TWO = TOUCH.DOLLY_PAN;
}

export function setOrbitGestureMode(controls, travelMode) {
  controls.touches.ONE = travelMode ? null : TOUCH.ROTATE;
  // Two fingers always remain camera input, including in pathway travel mode.
  controls.touches.TWO = TOUCH.DOLLY_PAN;
}

export function clampZoom(distance, delta, min, max) {
  return Math.max(min, Math.min(max, distance * Math.exp(Math.max(-.3, Math.min(.3, delta * .0018)))));
}
