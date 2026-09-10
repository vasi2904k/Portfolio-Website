export function compileGraph(tree) {
  const nodes = {}, order = [], edges = [];
  function visit(data, parentId, depth, position, direction) {
    if (!data.id || nodes[data.id]) throw new Error(`Invalid or duplicate graph node: ${data.id}`);
    const children = data.children || [];
    const node = { ...data, parentId, depth, position, direction, children: children.map(child => child.id) };
    nodes[node.id] = node; order.push(node.id);
    if (parentId) edges.push({ id: `${parentId}:${node.id}`, from: parentId, to: node.id });
    children.forEach((child, index) => {
      const angle = depth === 0 ? Math.PI * .83 - index * Math.PI * 2 / children.length : direction + (index - (children.length - 1) / 2) * Math.min(.58, 2.1 / Math.max(1, children.length - 1));
      const radius = depth === 0 ? 5.1 : 4.3 + children.length * .17;
      visit(child, node.id, depth + 1, [position[0] + Math.cos(angle) * radius, position[1] + Math.sin(angle) * radius * .78, position[2] - 2.3 - index % 3 * .7], angle);
    });
  }
  visit(tree, null, 0, [0, 0, 0], 0);
  return { rootId: tree.id, nodes, order, edges };
}

export function getVisibleIds(graph, expanded) {
  const result = [];
  function visit(id) { result.push(id); if (expanded.includes(id)) graph.nodes[id].children.forEach(visit); }
  visit(graph.rootId);
  return result;
}

export function initialNetworkState(graph) {
  return {
    currentNode: graph.rootId, parentNode: null, activePath: [graph.rootId],
    selectedNode: graph.rootId, expandedNodes: [graph.rootId], readyNodes: [graph.rootId],
    isAnimating: true, phase: "CAMERA_FOCUS", cameraTarget: graph.nodes[graph.rootId].position,
    cameraPosition: [0, .3, 23], navigationDepth: 0,
    contentNode: graph.rootId, hoveredNode: null, focusedNode: null,
    visited: [graph.rootId], navigationHistory: [graph.rootId], revision: 0, resetKey: 0,
  };
}

export function getAncestors(graph, id) {
  const ancestors = [];
  let current = graph.nodes[id];
  while (current) { ancestors.unshift(current.id); current = graph.nodes[current.parentId]; }
  return ancestors;
}

export function networkReducer(graph, state, action) {
  if (action.type === "CAMERA_POSE") {
    if (action.revision !== state.revision || !validVector(action.position) || !validVector(action.target)) return state;
    if (state.cameraPosition.every((value, axis) => Math.abs(value - action.position[axis]) < .0001) && state.cameraTarget.every((value, axis) => Math.abs(value - action.target[axis]) < .0001)) return state;
    return { ...state, cameraPosition: action.position, cameraTarget: action.target };
  }
  // Recenter is an emergency exit as well as a regular camera action. It may
  // cancel a focus/expansion transaction, without changing the active path.
  if (action.type === "RECENTER") return { ...state, phase: "CAMERA_FOCUS", isAnimating: true, cameraTarget: graph.nodes[state.currentNode].position, hoveredNode: null, revision: state.revision + 1 };
  // Callbacks belong to one navigation transaction. Stale animation callbacks
  // cannot unlock a newer transaction or reveal a collapsed branch.
  if (["CAMERA_STARTED", "CAMERA_SETTLED", "REVEAL"].includes(action.type)) {
    if (action.revision !== state.revision) return state;
    if (action.type === "CAMERA_STARTED") return ["SELECT", "BACK"].includes(state.phase) ? { ...state, phase: "CAMERA_FOCUS" } : state;
    if (action.type === "CAMERA_SETTLED") {
      if (!["SELECT", "BACK", "CAMERA_FOCUS"].includes(state.phase)) return state;
      const expandedNodes = graph.nodes[state.currentNode].children.length && !state.expandedNodes.includes(state.currentNode) ? [...state.expandedNodes, state.currentNode] : state.expandedNodes;
      const complete = graph.nodes[state.currentNode].children.every(id => state.readyNodes.includes(id));
      return { ...state, expandedNodes, phase: complete ? "CONTENT_VIEW" : "EXPAND_BRANCH", isAnimating: !complete, contentNode: complete ? state.currentNode : state.contentNode };
    }
    if (state.phase !== "EXPAND_BRANCH" || !getVisibleIds(graph, state.expandedNodes).includes(action.id) || state.readyNodes.includes(action.id)) return state;
    const readyNodes = [...state.readyNodes, action.id];
    const complete = graph.nodes[state.currentNode].children.every(id => readyNodes.includes(id));
    return { ...state, readyNodes, isAnimating: !complete, phase: complete ? "CONTENT_VIEW" : state.phase, contentNode: complete ? state.currentNode : state.contentNode };
  }
  if (state.isAnimating) return state;
  if (action.type === "HOVER" || action.type === "FOCUS") {
    const id = action.id;
    if (id && !getAvailableIds(graph, state).includes(id)) return state;
    const key = action.type === "HOVER" ? "hoveredNode" : "focusedNode";
    if (state[key] === id) return state;
    return { ...state, [key]: id, ...(id ? { [action.type === "HOVER" ? "focusedNode" : "hoveredNode"]: null } : {}), phase: id ? "HOVER" : "IDLE" };
  }
  let id = action.id;
  const backward = action.type === "BACK" || (action.type === "STEP" && action.direction < 0);
  if (action.type === "STEP") id = action.direction < 0 ? state.navigationHistory.at(-2) : getNextNode(graph, state);
  if (action.type === "BACK") id = state.navigationHistory.at(-2);
  if (action.type === "RESET") id = graph.rootId;
  if (!["SELECT", "STEP", "BACK", "RESET"].includes(action.type)) return state;
  if (!id || !graph.nodes[id]) return state;
  if (!backward && action.type !== "RESET" && (!state.readyNodes.includes(id) || !getVisibleIds(graph, state.expandedNodes).includes(id))) return state;
  if (id === state.currentNode) {
    if (action.type !== "RESET") return state;
    return { ...networkReducer(graph, state, { type: "RECENTER" }), navigationHistory: [graph.rootId], parentNode: null, resetKey: state.resetKey + 1 };
  }
  const node = graph.nodes[id], activePath = getAncestors(graph, id);
  const navigationHistory = action.type === "RESET" ? [graph.rootId]
    : backward ? state.navigationHistory.slice(0, -1)
      : [...state.navigationHistory, id];
  // History can cross branches through Map or breadcrumbs. Re-open the
  // destination's ancestors so the previous real location is always valid.
  const retained = action.type === "RESET" ? [graph.rootId] : state.expandedNodes.filter(item => activePath.includes(item));
  const expandedNodes = [...new Set([...retained, ...activePath.slice(0, -1)])];
  const visible = getVisibleIds(graph, expandedNodes);
  const readyNodes = [...new Set([...state.readyNodes.filter(item => visible.includes(item)), ...activePath])];
  return {
    ...state, currentNode: id, selectedNode: id, parentNode: navigationHistory.at(-2) || null, activePath,
    expandedNodes, readyNodes, navigationHistory,
    cameraTarget: node.position, navigationDepth: node.depth, isAnimating: true,
    phase: backward || action.type === "RESET" || activePath.length < state.activePath.length ? "BACK" : "SELECT",
    hoveredNode: null, focusedNode: null,
    visited: state.visited.includes(id) ? state.visited : [...state.visited, id], revision: state.revision + 1,
    resetKey: state.resetKey + (action.type === "RESET" ? 1 : 0),
  };
}

function validVector(value) { return Array.isArray(value) && value.length === 3 && value.every(Number.isFinite); }

export function getNodeState(graph, state, id, hoveredId, ready = true) {
  if (!getVisibleIds(graph, state.expandedNodes).includes(id)) return "hidden";
  if (!ready) return "inactive";
  if (state.selectedNode === id) return "selected";
  if (hoveredId === id) return "hover";
  if (state.expandedNodes.includes(id)) return "expanded";
  if (getAvailableIds(graph, state).includes(id)) return "available";
  return "inactive";
}

export function getAvailableIds(graph, state) {
  const node = graph.nodes[state.currentNode];
  return [state.currentNode, ...node.children].filter(id => state.readyNodes.includes(id));
}

export function getNextNode(graph, state) {
  const children = graph.nodes[state.currentNode].children;
  const candidate = children.includes(state.focusedNode) ? state.focusedNode : children.includes(state.hoveredNode) ? state.hoveredNode : children[0];
  return state.readyNodes.includes(candidate) ? candidate : null;
}

export function getFocusIds(graph, selectedId) {
  const node = graph.nodes[selectedId];
  return [selectedId, ...node.children];
}
