import test from "node:test";
import assert from "node:assert/strict";
import { PerspectiveCamera, Vector3, TOUCH } from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { configureOrbit, clampZoom, setOrbitGestureMode } from "../src/utils/orbitCamera.mjs";
import { compileGraph, initialNetworkState, networkReducer } from "../src/utils/graphModel.mjs";
import { createNeuralEnvironment } from "../src/utils/neuralEnvironment.mjs";
import { NEURAL_QUALITY } from "../src/config/neuralPalette.mjs";

test("camera telemetry cannot change the path, accept stale poses, or store invalid coordinates", () => {
  const graph = compileGraph({ id: "root", children: [{ id: "skills" }] });
  const initial = initialNetworkState(graph);
  const action = { type: "CAMERA_POSE", position: [3, 2, 18], target: [.5, 0, 0], revision: 0 };
  const state = networkReducer(graph, initial, action);
  assert.deepEqual(state.cameraPosition, action.position);
  for (const key of ["currentNode", "selectedNode", "activePath", "expandedNodes", "navigationDepth", "revision", "isAnimating"]) assert.deepEqual(state[key], initial[key]);
  for (const bad of [{ ...action, revision: -1 }, { ...action, position: [NaN, 0, 0] }, { ...action, target: [0, 0] }]) assert.equal(networkReducer(graph, state, bad), state);
});

test("emergency Recenter can recover during expansion and rejects cancelled callbacks", () => {
  const graph = compileGraph({ id: "root", children: [{ id: "skills" }] });
  let state = initialNetworkState(graph);
  state = networkReducer(graph, state, { type: "CAMERA_SETTLED", revision: 0 });
  assert.equal(state.phase, "EXPAND_BRANCH");
  const recovered = networkReducer(graph, state, { type: "RECENTER" });
  assert.equal(recovered.phase, "CAMERA_FOCUS");
  assert.deepEqual(recovered.activePath, state.activePath);
  assert.deepEqual(recovered.expandedNodes, state.expandedNodes);
  assert.equal(networkReducer(graph, recovered, { type: "REVEAL", id: "skills", revision: 0 }), recovered);
  state = networkReducer(graph, recovered, { type: "CAMERA_SETTLED", revision: recovered.revision });
  state = networkReducer(graph, state, { type: "REVEAL", id: "skills", revision: recovered.revision });
  assert.equal(state.isAnimating, false);
});

for (const mobile of [false, true]) test(`${mobile ? "touch" : "desktop"} OrbitControls constrain real camera rotation, distance, and panning`, () => {
  const camera = new PerspectiveCamera(44, 1.5, .1, 500);
  camera.position.set(0, .3, 23);
  const controls = new OrbitControls(camera);
  configureOrbit(controls, 23, mobile, true);
  for (const position of [[0, 999, 0], [999, -999, -999], [0, 0, .00001], [-999, 0, 999]]) {
    camera.position.fromArray(position); controls.update();
    assert(controls.getDistance() >= controls.minDistance - 1e-6);
    assert(controls.getDistance() <= controls.maxDistance + 1e-6);
    assert(controls.getPolarAngle() >= controls.minPolarAngle - 1e-6);
    assert(controls.getPolarAngle() <= controls.maxPolarAngle + 1e-6);
    assert(controls.getAzimuthalAngle() >= controls.minAzimuthAngle - 1e-6);
    assert(controls.getAzimuthalAngle() <= controls.maxAzimuthAngle + 1e-6);
    assert(camera.up.equals(new Vector3(0, 1, 0)));
  }
  controls.target.set(900, 900, 900); controls.update();
  assert(controls.target.distanceTo(controls.cursor) <= controls.maxTargetRadius + 1e-6);
  let distance = 23;
  for (let i = 0; i < 100; i++) distance = clampZoom(distance, -10000, controls.minDistance, controls.maxDistance);
  assert.equal(distance, controls.minDistance);
  for (let i = 0; i < 100; i++) distance = clampZoom(distance, 10000, controls.minDistance, controls.maxDistance);
  assert.equal(distance, controls.maxDistance);
  setOrbitGestureMode(controls, true);
  assert.equal(controls.touches.ONE, null); assert.equal(controls.touches.TWO, TOUCH.DOLLY_PAN);
  setOrbitGestureMode(controls, false); assert.equal(controls.touches.ONE, TOUCH.ROTATE);
});

test("all quality tiers retain genuine depth and finite, connected signal paths", () => {
  let previous = Infinity;
  for (const quality of Object.values(NEURAL_QUALITY)) {
    const environment = createNeuralEnvironment(quality);
    assert(environment.fibers.length < previous); previous = environment.fibers.length;
    for (const values of [environment.fibers, environment.phases, environment.fieldPositions, environment.fieldEdges, environment.dust]) assert(values.every(Number.isFinite));
    const depths = environment.centers.map(node => node.position[2]);
    assert(Math.max(...depths) - Math.min(...depths) > 40);
    assert(environment.centers.some(node => node.position[0] < 0) && environment.centers.some(node => node.position[0] > 0));
    assert(environment.fieldEdges.length > 0 && environment.clouds.length > 0);
    for (const path of environment.paths) assert(path.points.every(Number.isFinite) && path.points.length >= 6);
  }
  assert.deepEqual(createNeuralEnvironment(NEURAL_QUALITY.mobile), createNeuralEnvironment(NEURAL_QUALITY.mobile));
});
