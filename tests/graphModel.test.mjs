import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PerspectiveCamera, Vector3 } from "three";
import { compileGraph, initialNetworkState, networkReducer, getVisibleIds, getAncestors, getNodeState, getFocusIds } from "../src/utils/graphModel.mjs";
import { calculateCameraFrame } from "../src/utils/cameraFrame.mjs";

const fixture = { id: "root", children: [
  { id: "about", children: [{ id: "story" }] },
  { id: "skills", children: [{ id: "python", children: [{ id: "pandas" }, { id: "numpy" }] }, { id: "ml" }] },
  { id: "projects", children: [{ id: "project-a" }, { id: "project-b" }] },
  { id: "journey" }, { id: "connect" },
] };
const graph = compileGraph(fixture);
const reduce = (state, action) => networkReducer(graph, state, action);

test("initial network reveals exactly the origin and five primary branches", () => {
  const state = initialNetworkState(graph);
  assert.deepEqual(getVisibleIds(graph, state.expanded), ["root", "about", "skills", "projects", "journey", "connect"]);
  assert.equal(getNodeState(graph, state, "python", null), "hidden");
});

test("selecting a branch reveals only direct children, without mutating prior state", () => {
  const initial = initialNetworkState(graph);
  const state = reduce(initial, { type: "SELECT", id: "skills" });
  assert.equal(state.selectedId, "skills");
  assert(getVisibleIds(graph, state.expanded).includes("python"));
  assert(!getVisibleIds(graph, state.expanded).includes("pandas"));
  assert.deepEqual(initial.expanded, ["root"]);
  assert.deepEqual(initial.history, []);
  assert.equal(getNodeState(graph, state, "skills", null), "selected");
  assert(state.expanded.includes("skills"));
});

test("repeated expansion is idempotent and hidden/unknown selection is ignored", () => {
  const initial = initialNetworkState(graph);
  assert.equal(reduce(initial, { type: "SELECT", id: "pandas" }), initial);
  assert.equal(reduce(initial, { type: "SELECT", id: "missing" }), initial);
  const state = reduce(initial, { type: "SELECT", id: "skills" });
  assert.equal(reduce(state, { type: "SELECT", id: "skills" }), state);
  assert.equal(new Set(state.expanded).size, state.expanded.length);
});

test("branch switching retains valid paths and back follows visited history", () => {
  let state = initialNetworkState(graph);
  for (const id of ["skills", "python", "pandas", "projects", "project-a"]) state = reduce(state, { type: "SELECT", id });
  state = reduce(state, { type: "BACK" });
  assert.equal(state.selectedId, "projects");
  state = reduce(state, { type: "BACK" });
  assert.equal(state.selectedId, "pandas");
  assert.deepEqual(getAncestors(graph, "pandas"), ["root", "skills", "python", "pandas"]);
  for (const id of getVisibleIds(graph, state.expanded)) for (const ancestor of getAncestors(graph, id)) assert(getVisibleIds(graph, state.expanded).includes(ancestor));
});

test("scroll traversal remains anchored by ID as branches change the traversal", () => {
  let state = initialNetworkState(graph);
  state = reduce(state, { type: "STEP", direction: 1 });
  assert.equal(state.selectedId, "about");
  state = reduce(state, { type: "STEP", direction: 1 });
  assert.equal(state.selectedId, "story");
  state = reduce(state, { type: "STEP", direction: 1 });
  assert.equal(state.selectedId, "skills");
  state = reduce(state, { type: "STEP", direction: 1 });
  assert.equal(state.selectedId, "python");
  state = reduce(state, { type: "STEP", direction: 1 });
  assert.equal(state.selectedId, "pandas");
  state = reduce(state, { type: "STEP", direction: -1 });
  assert.equal(state.selectedId, "python");
});

test("reset invalidates expansion generations and restores initial navigation", () => {
  let state = initialNetworkState(graph);
  state = reduce(state, { type: "SELECT", id: "skills" });
  state = reduce(state, { type: "SELECT", id: "python" });
  const reset = reduce(state, { type: "RESET" });
  assert.deepEqual(reset.expanded, ["root"]); assert.deepEqual(reset.history, []);
  assert.deepEqual(reset.visited, ["root"]); assert.equal(reset.selectedId, "root");
  assert.equal(reset.resetKey, state.resetKey + 1); assert(reset.revision > state.revision);
  assert.equal(reduce(reset, { type: "SELECT", id: "pandas" }), reset);
});

test("rapid interleaved navigation cannot select hidden nodes or duplicate visibility", () => {
  let state = initialNetworkState(graph);
  for (let i = 0; i < 600; i++) {
    const actions = [{ type: "STEP", direction: 1 }, { type: "SELECT", id: graph.order[(i * 7) % graph.order.length] }, { type: "BACK" }, { type: "STEP", direction: -1 }];
    state = reduce(state, i % 17 === 0 ? { type: "RESET" } : actions[i % actions.length]);
    const visible = getVisibleIds(graph, state.expanded);
    assert(visible.includes(state.selectedId)); assert.equal(new Set(visible).size, visible.length);
    assert.equal(new Set(state.visited).size, state.visited.length);
  }
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
const graphSource = await readFile(new URL("../src/data/neuralGraph.js", import.meta.url), "utf8");
const { createPortfolioGraph } = await import(dataUrl(graphSource.replace("@/config/config", dataUrl(configSource))));
const repositories = JSON.parse(await readFile(new URL("../src/data/fallbackRepos.json", import.meta.url), "utf8"));
const portfolio = compileGraph(createPortfolioGraph(repositories));

test("real portfolio preserves configured projects when GitHub data is incomplete", () => {
  const projects = portfolio.nodes.projects.children;
  assert.equal(projects.length, 8);
  assert(projects.some(id => portfolio.nodes[id].label === "Admission prediction"));
  assert.equal(portfolio.nodes.root.children.length, 5);
  assert(portfolio.order.length > 40);
  for (const node of Object.values(portfolio.nodes)) {
    assert(node.title && node.summary);
    for (const action of node.actions || []) assert(/^(https:\/\/|mailto:)/.test(action.href));
  }
});

test("forward traversal can explore every node in the actual portfolio", () => {
  let state = initialNetworkState(portfolio);
  for (let i = 0; i < portfolio.order.length + 5; i++) state = networkReducer(portfolio, state, { type: "STEP", direction: 1 });
  assert.equal(state.visited.length, portfolio.order.length);
  assert.equal(getVisibleIds(portfolio, state.expanded).length, portfolio.order.length);
});

for (const [width, height, compact] of [[1440, 900, false], [1280, 720, false], [1024, 768, false], [390, 844, true], [320, 568, true], [600, 550, true], [844, 390, false], [667, 375, false]]) {
  test(`camera keeps selected branches and labels inside the usable viewport at ${width}×${height}`, () => {
    const camera = new PerspectiveCamera(44, width / height, .1, 220), point = new Vector3();
    for (const id of portfolio.order) {
      const frame = calculateCameraFrame(portfolio, id, width, height, compact);
      assert(Object.values(frame).every(Number.isFinite));
      camera.position.set(frame.x, frame.y + .3, frame.z + frame.distance); camera.lookAt(frame.x, frame.y, frame.z); camera.updateMatrixWorld();
      for (const child of getFocusIds(portfolio, id)) {
        const node = portfolio.nodes[child];
        point.fromArray(node.position); point.y -= node.depth === 0 ? .68 : .53; point.project(camera);
        const x = (point.x + 1) / 2, y = (1 - point.y) / 2;
        assert(x > .025 && x < (compact ? .975 : .67), `${id}/${child}: horizontal label position ${x.toFixed(3)}`);
        assert(y > .09 && y < (compact ? .55 : .87), `${id}/${child}: vertical label position ${y.toFixed(3)}`);
        assert(point.z > -1 && point.z < 1);
      }
    }
  });
}
