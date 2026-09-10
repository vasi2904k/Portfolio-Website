import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PerspectiveCamera, Vector3 } from "three";
import { compileGraph, initialNetworkState, networkReducer, getVisibleIds, getAncestors, getNodeState, getFocusIds, getAvailableIds, getNextNode } from "../src/utils/graphModel.mjs";
import { getGraphViewport, isCameraFrameSafe } from "../src/utils/cameraFrame.mjs";
import { classifyTouch, consumeWheel, createWheelGesture, cycleAvailable } from "../src/utils/navigationInput.mjs";
import { getOrbitFrame } from "../src/utils/orbitCamera.mjs";
import { arrangeNodeLabels, getLabelWidth } from "../src/utils/nodeLabels.mjs";
import { parseProjectReadme } from "../src/utils/readmeProject.mjs";

const fixture = { id: "root", children: [
  { id: "about", children: [{ id: "story" }] },
  { id: "skills", children: [{ id: "python", children: [{ id: "pandas" }, { id: "numpy" }] }, { id: "ml" }] },
  { id: "projects", children: [{ id: "project-a" }, { id: "project-b" }] },
  { id: "journey" }, { id: "connect" },
] };
const graph = compileGraph(fixture);
const reduce = (state, action) => networkReducer(graph, state, action);
function settle(state, model = graph) {
  state = networkReducer(model, state, { type: "CAMERA_SETTLED", revision: state.revision });
  for (const id of getVisibleIds(model, state.expandedNodes)) state = networkReducer(model, state, { type: "REVEAL", id, revision: state.revision });
  assert.equal(state.isAnimating, false);
  return state;
}
const start = () => settle(initialNetworkState(graph));
const choose = (state, id) => settle(reduce(state, { type: "SELECT", id }));

test("initial state explicitly tracks location, target and loading lock", () => {
  const state = initialNetworkState(graph);
  assert.equal(state.currentNode, "root"); assert.equal(state.parentNode, null);
  assert.deepEqual(state.navigationHistory, ["root"]);
  assert.deepEqual(state.activePath, ["root"]); assert.equal(state.isAnimating, true);
  assert.deepEqual(state.cameraTarget, graph.nodes.root.position);
  assert.deepEqual(getVisibleIds(graph, state.expandedNodes), ["root", "about", "skills", "projects", "journey", "connect"]);
  assert.equal(getNodeState(graph, state, "python", null), "hidden");
});

test("focus completes before branch growth; content and inputs unlock after every child", () => {
  const initial = start();
  let state = reduce(initial, { type: "SELECT", id: "skills" });
  assert.equal(state.phase, "SELECT"); assert.equal(state.contentNode, "root");
  assert(!getVisibleIds(graph, state.expandedNodes).includes("python"));
  state = reduce(state, { type: "CAMERA_STARTED", revision: state.revision });
  assert.equal(state.phase, "CAMERA_FOCUS");
  state = reduce(state, { type: "CAMERA_SETTLED", revision: state.revision });
  assert.equal(state.phase, "EXPAND_BRANCH"); assert.equal(state.isAnimating, true);
  assert(getVisibleIds(graph, state.expandedNodes).includes("python"));
  assert(!getVisibleIds(graph, state.expandedNodes).includes("pandas"));
  state = reduce(state, { type: "REVEAL", id: "python", revision: state.revision });
  assert.equal(state.isAnimating, true);
  state = reduce(state, { type: "REVEAL", id: "ml", revision: state.revision });
  assert.equal(state.phase, "CONTENT_VIEW"); assert.equal(state.isAnimating, false);
  assert.equal(state.contentNode, "skills");
  assert.deepEqual(initial.expandedNodes, ["root"]);
});

test("click, back, reset, focus and scroll cannot interrupt transitions", () => {
  const state = reduce(start(), { type: "SELECT", id: "skills" });
  for (const action of [{ type: "SELECT", id: "projects" }, { type: "BACK" }, { type: "RESET" }, { type: "STEP", direction: 1 }, { type: "HOVER", id: "root" }]) assert.equal(reduce(state, action), state);
  assert.equal(settle(state).currentNode, "skills");
});

test("stale and premature callbacks cannot reveal nodes or finish focus", () => {
  const state = reduce(start(), { type: "SELECT", id: "skills" });
  assert.equal(reduce(state, { type: "CAMERA_SETTLED", revision: state.revision - 1 }), state);
  assert.equal(reduce(state, { type: "REVEAL", id: "python", revision: state.revision }), state);
  const focused = reduce(state, { type: "CAMERA_SETTLED", revision: state.revision });
  assert.equal(reduce(focused, { type: "REVEAL", id: "pandas", revision: state.revision }), focused);
  assert.equal(reduce(focused, { type: "REVEAL", id: "python", revision: state.revision - 1 }), focused);
});

test("hidden, unknown and repeated selections are ignored", () => {
  const state = start();
  for (const id of ["pandas", "missing", "root"]) assert.equal(reduce(state, { type: "SELECT", id }), state);
});

test("Back follows actual visit history across branch switches", () => {
  let state = start();
  for (const id of ["skills", "python", "pandas", "projects", "project-a"]) state = choose(state, id);
  state = settle(reduce(state, { type: "BACK" }));
  assert.equal(state.currentNode, "projects");
  state = settle(reduce(state, { type: "BACK" }));
  assert.equal(state.currentNode, "pandas");
  assert(!getVisibleIds(graph, state.expandedNodes).includes("project-a"));
  assert(state.readyNodes.includes("pandas"));
  assert.deepEqual(state.activePath, ["root", "skills", "python", "pandas"]);
  assert.deepEqual(state.navigationHistory, ["root", "skills", "python", "pandas"]);
  assert.equal(state.parentNode, "python");
});

test("Back restores the parent branch one level at a time", () => {
  let state = start();
  for (const id of ["skills", "python", "pandas"]) state = choose(state, id);
  assert.deepEqual(state.activePath, ["root", "skills", "python", "pandas"]);
  for (const id of ["python", "skills", "root"]) { state = settle(reduce(state, { type: "BACK" })); assert.equal(state.currentNode, id); }
  assert.equal(reduce(state, { type: "BACK" }), state);
});

test("forward travel follows the focused child and stops at a leaf", () => {
  let state = reduce(start(), { type: "FOCUS", id: "skills" });
  assert.equal(getNextNode(graph, state), "skills");
  state = settle(reduce(state, { type: "STEP", direction: 1 }));
  assert.equal(state.currentNode, "skills");
  state = settle(reduce(state, { type: "STEP", direction: 1 }));
  assert.equal(state.currentNode, "python");
  state = settle(reduce(state, { type: "STEP", direction: 1 }));
  assert.equal(state.currentNode, "pandas");
  assert.equal(getNextNode(graph, state), null);
  assert.equal(reduce(state, { type: "STEP", direction: 1 }), state);
  state = settle(reduce(state, { type: "STEP", direction: -1 }));
  assert.equal(state.currentNode, "python");
});

test("keyboard focus changes neither selection nor the camera transaction", () => {
  const initial = start();
  const ids = getAvailableIds(graph, initial);
  const next = cycleAvailable(ids, "root", 1);
  const state = reduce(initial, { type: "FOCUS", id: next });
  assert.equal(state.currentNode, initial.currentNode);
  assert.equal(state.revision, initial.revision);
  assert.equal(state.isAnimating, false);
  assert.equal(cycleAvailable(ids, ids[0], -1), ids.at(-1));
  assert.equal(cycleAvailable(ids, ids.at(-1), 1), ids[0]);
  assert.equal(getNodeState(graph, state, next, next), "hover");
});

test("Recenter preserves the active path, content and exploration", () => {
  const initial = choose(choose(start(), "skills"), "python");
  let state = reduce(initial, { type: "RECENTER" });
  assert(state.isAnimating); assert.equal(state.revision, initial.revision + 1);
  state = settle(state);
  for (const key of ["activePath", "visited", "readyNodes", "currentNode", "contentNode"]) assert.deepEqual(state[key], initial[key]);
});

test("switching between keyboard and mouse updates the forward destination", () => {
  let state = reduce(start(), { type: "FOCUS", id: "skills" });
  assert.equal(getNextNode(graph, state), "skills");
  state = reduce(state, { type: "HOVER", id: "projects" });
  assert.equal(getNextNode(graph, state), "projects");
  state = reduce(state, { type: "FOCUS", id: "about" });
  assert.equal(getNextNode(graph, state), "about");
});

test("Return to root collapses branches, retains progress and rejects old reveals", () => {
  const prior = choose(choose(start(), "skills"), "python");
  let state = settle(reduce(prior, { type: "RESET" }));
  assert.deepEqual(state.expandedNodes, ["root"]); assert.equal(state.currentNode, "root");
  assert.deepEqual(state.navigationHistory, ["root"]); assert.equal(state.parentNode, null);
  assert.deepEqual(state.visited, prior.visited);
  assert.equal(state.resetKey, prior.resetKey + 1);
  assert.equal(reduce(state, { type: "REVEAL", id: "pandas", revision: prior.revision }), state);
  state = choose(state, "skills");
  assert(!state.readyNodes.includes("pandas"));
});

test("random interleaved inputs preserve visibility, ancestry and transaction invariants", () => {
  let state = start();
  for (let i = 0; i < 1000; i++) {
    const actions = [{ type: "STEP", direction: 1 }, { type: "SELECT", id: graph.order[(i * 7) % graph.order.length] }, { type: "BACK" }, { type: "RESET" }, { type: "CAMERA_SETTLED", revision: state.revision - 1 }];
    state = reduce(state, actions[i % actions.length]);
    if (i % 3 === 0) state = settle(state);
    const visible = getVisibleIds(graph, state.expandedNodes);
    assert(visible.includes(state.currentNode));
    assert.deepEqual(state.activePath, getAncestors(graph, state.currentNode));
    assert.equal(state.navigationHistory.at(-1), state.currentNode);
    assert.equal(state.parentNode, state.navigationHistory.at(-2) || null);
    assert(state.navigationHistory.every(id => graph.nodes[id] && state.visited.includes(id)));
    assert.equal(new Set(state.readyNodes).size, state.readyNodes.length);
    assert(state.readyNodes.every(id => visible.includes(id)));
    assert.equal(new Set(state.visited).size, state.visited.length);
  }
});

test("a long aggressive wheel burst cannot skip states even after animations unlock", () => {
  const gesture = createWheelGesture();
  let moves = 0;
  for (let time = 0; time < 5000; time += 20) moves += !!consumeWheel(gesture, 120, time, time > 0 && time < 1800);
  assert.equal(moves, 1);
  assert.equal(consumeWheel(gesture, -120, 5400, false), -1);
});

test("wheel thresholds reset on quiet gaps or reversal; line/page modes normalize", () => {
  const gesture = createWheelGesture();
  assert.equal(consumeWheel(gesture, 40, 0, false), 0);
  assert.equal(consumeWheel(gesture, 40, 20, false), 0);
  assert.equal(consumeWheel(gesture, -40, 40, false), 0);
  assert.equal(consumeWheel(gesture, 70, 400, false), 0);
  assert.equal(consumeWheel(gesture, 20, 420, false), 1);
  assert.equal(consumeWheel(gesture, -6, 800, false, 1), -1);
  assert.equal(consumeWheel(gesture, 1, 1200, false, 2), 1);
});

test("wheel input during a transition is discarded through the end of its momentum", () => {
  const gesture = createWheelGesture();
  assert.equal(consumeWheel(gesture, 100, 0, true), 0);
  assert.equal(consumeWheel(gesture, 100, 30, false), 0);
  assert.equal(consumeWheel(gesture, 100, 500, false), 1);
});

test("touch separates taps, directional swipes, drags, long presses and multi-touch", () => {
  assert.equal(classifyTouch(2, 3, 180, 4), "tap");
  assert.equal(classifyTouch(8, -100, 450, 101), "forward");
  assert.equal(classifyTouch(10, 100, 450, 101), "back");
  assert.equal(classifyTouch(80, -80, 400, 113), "drag");
  assert.equal(classifyTouch(90, 2, 350, 91), "drag");
  assert.equal(classifyTouch(2, 2, 300, 50), "drag");
  assert.equal(classifyTouch(0, 0, 900, 0), "drag");
  assert.equal(classifyTouch(0, -120, 1300, 120), "drag");
  assert.equal(classifyTouch(0, -120, 300, 120, true), "cancel");
});

test("layout is deterministic, genuinely 3D, and rejects duplicate IDs", () => {
  assert.deepEqual(compileGraph(fixture), graph);
  assert(new Set(graph.order.map(id => graph.nodes[id].position[2])).size > 3);
  assert(graph.order.every(id => graph.nodes[id].position.every(Number.isFinite)));
  assert.throws(() => compileGraph({ id: "root", children: [{ id: "root" }] }), /duplicate/);
  assert.equal(graph.edges.length, graph.order.length - 1);
});

// Load the app's actual data module while resolving its Next.js config alias.
const dataUrl = text => `data:text/javascript;base64,${Buffer.from(text).toString("base64")}`;
const configSource = await readFile(new URL("../src/config/config.js", import.meta.url), "utf8");
const configUrl = dataUrl(configSource);
const classifierSource = await readFile(new URL("../src/utils/projectClassifier.mjs", import.meta.url), "utf8");
const classifierUrl = dataUrl(classifierSource.replace("@/config/config", configUrl));
const graphSource = await readFile(new URL("../src/data/neuralGraph.js", import.meta.url), "utf8");
const { classifyProject, stableProjectId } = await import(classifierUrl);
const { createPortfolioGraph } = await import(dataUrl(graphSource.replace("@/config/config", configUrl).replace("@/utils/projectClassifier.mjs", classifierUrl)));
const repositories = JSON.parse(await readFile(new URL("../src/data/fallbackRepos.json", import.meta.url), "utf8"));
const portfolio = compileGraph(createPortfolioGraph(repositories));

test("real portfolio groups synchronized projects without duplicating nodes", () => {
  const projects = portfolio.order.filter(id => portfolio.nodes[id].kind === "project");
  assert.equal(projects.length, repositories.length);
  assert.equal(portfolio.nodes.projects.children[0], "projects-featured");
  assert(projects.some(id => portfolio.nodes[id].label === "AgroLens AI"));
  assert.equal(portfolio.nodes.root.children.length, 5);
  assert(portfolio.order.length > 30);
  for (const node of Object.values(portfolio.nodes)) {
    assert(node.title && node.summary);
    for (const action of node.actions || []) assert(/^(https:\/\/|mailto:)/.test(action.href));
  }
});

test("project classification is deterministic, rename-stable, and manually overridable", () => {
  assert.equal(stableProjectId({ id: 9123, name: "old-name" }), stableProjectId({ id: 9123, name: "new-name" }));
  const manual = classifyProject({ name: "AgroLens-AI", topics: [], language: "Jupyter Notebook" });
  assert.equal(manual.category, "ai"); assert.equal(manual.featured, true); assert.equal(manual.priority, 1);
  const automatic = classifyProject({ name: "document-agent", topics: ["rag", "llm", "portfolio-project"], language: "Python", description: "A grounded document agent" });
  assert.equal(automatic.category, "ai"); assert.equal(automatic.subcategory, "rag"); assert.equal(automatic.featured, true);
  assert.equal(classifyProject({ name: "coursework", topics: ["practice"] }).hidden, true);
});

test("README parser only exposes authored project evidence", () => {
  const parsed = parseProjectReadme(`# Demo\n\n## Overview\nA grounded assistant.\n\n## Problem\nDocuments are difficult to search.\n\n## Solution\n- Chunk documents\n- Retrieve relevant passages\n\n## Tech Stack\n- Python\n- FastAPI\n\n## Results\n- Recall@5: 0.82`);
  assert.equal(parsed.overview, "A grounded assistant.");
  assert.equal(parsed.problem, "Documents are difficult to search.");
  assert.deepEqual(parsed.technologies, ["Python", "FastAPI"]);
  assert.deepEqual(parsed.metrics, ["Recall@5: 0.82"]);
  assert.equal(parsed.architecture, undefined);
});


test("every portfolio node remains reachable through its own branch", () => {
  let state = settle(initialNetworkState(portfolio), portfolio);
  function explore(id) {
    if (id !== state.currentNode) state = settle(networkReducer(portfolio, state, { type: "SELECT", id }), portfolio);
    assert.equal(state.currentNode, id);
    for (const child of portfolio.nodes[id].children) {
      explore(child);
      state = settle(networkReducer(portfolio, state, { type: "BACK" }), portfolio);
      assert.equal(state.currentNode, id);
    }
  }
  explore(portfolio.rootId);
  assert.equal(state.visited.length, portfolio.order.length);
});

test("a full GitHub response keeps every repository reachable without overcrowded branches", () => {
  const repos = Array.from({ length: 100 }, (_, i) => ({ name: "experiment-" + i, description: "Experiment " + i }));
  const large = compileGraph(createPortfolioGraph(repos));
  assert(large.order.every(id => large.nodes[id].children.length <= 9));
  for (const repo of repos) {
    const id = "project-" + repo.name;
    assert(large.nodes[id]);
    assert.equal(getAncestors(large, id)[0], large.rootId);
  }
});

test("camera safety recognizes invisible, rolled and invalid poses", () => {
  const camera = new PerspectiveCamera(44, 1.5, .1, 500);
  camera.position.set(0, .3, 23); camera.lookAt(0, 0, 0); camera.updateMatrixWorld();
  const point = new Vector3(0, 0, 0).project(camera);
  assert(isCameraFrameSafe(point, camera));
  assert(!isCameraFrameSafe(new Vector3(2, 0, .5), camera));
  assert(!isCameraFrameSafe(new Vector3(0, 0, 2), camera));
  camera.rotation.z = Math.PI / 2; camera.updateMatrixWorld();
  assert(!isCameraFrameSafe(point, camera));
  camera.position.x = NaN;
  assert(!isCameraFrameSafe(point, camera));
});

for (const [width, height, compact] of [[1920, 1080, false], [1440, 900, false], [1280, 720, false], [1024, 768, false], [390, 844, true], [320, 568, true], [600, 550, true], [844, 390, false], [667, 375, false]]) {
  test("large node labels remain separate and inside the graph at " + width + "×" + height, () => {
    const rect = getGraphViewport(width, height, compact);
    for (let count = 1; count <= 10; count++) {
      // Worst case: every anchor projects to the same position.
      const items = Array.from({ length: count }, (_, id) => ({ id, desiredX: (rect.left + rect.right) / 2, desiredY: (rect.top + rect.bottom) / 2 }));
      const labelWidth = getLabelWidth(rect, count);
      assert(labelWidth >= 44);
      arrangeNodeLabels(items, rect, labelWidth);
      for (const a of items) {
        assert(a.x - labelWidth / 2 >= rect.left && a.x + labelWidth / 2 <= rect.right);
        assert(a.y - 27 >= rect.top && a.y + 27 <= rect.bottom);
        for (const b of items) if (a !== b) assert(Math.abs(a.x - b.x) >= labelWidth || Math.abs(a.y - b.y) >= 54, "overlapping labels " + a.id + "/" + b.id);
      }
    }
  });
  test("camera centers the active neuron and fits branch nodes at " + width + "×" + height, () => {
    const camera = new PerspectiveCamera(44, width / height, .1, 500), point = new Vector3();
    for (const panelExpanded of compact ? [false, true] : [false]) for (const id of portfolio.order) {
      const frame = getOrbitFrame(portfolio, id, width, height, compact, panelExpanded);
      const rect = getGraphViewport(width, height, compact, panelExpanded);
      assert(Object.values(frame).flat().every(Number.isFinite));
      camera.position.fromArray(frame.position); camera.lookAt(...frame.target); camera.setViewOffset(width, height, frame.offsetX, frame.offsetY, width, height); camera.updateMatrixWorld();
      for (const child of getFocusIds(portfolio, id)) {
        point.fromArray(portfolio.nodes[child].position).project(camera);
        const x = (point.x + 1) * width / 2, y = (1 - point.y) * height / 2;
        assert(x >= rect.left && x <= rect.right, id + "/" + child + ": x=" + x);
        assert(y >= rect.top && y <= rect.bottom, id + "/" + child + ": y=" + y);
        assert(point.z > -1 && point.z < 1);
        if (id === child) {
          assert(Math.abs(x - (rect.left + rect.right) / 2) < 3);
          assert(Math.abs(y - (rect.top + rect.bottom) / 2) < 3);
          assert(isCameraFrameSafe(point, camera));
        }
      }
    }
  });
}
