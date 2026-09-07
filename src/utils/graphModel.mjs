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
  return { selectedId: graph.rootId, expanded: [graph.rootId], history: [], visited: [graph.rootId], revision: 0, resetKey: 0 };
}

export function getAncestors(graph, id) {
  const ancestors = [];
  let current = graph.nodes[id];
  while (current) { ancestors.unshift(current.id); current = graph.nodes[current.parentId]; }
  return ancestors;
}

export function networkReducer(graph, state, action) {
  if (action.type === "RESET") return { ...initialNetworkState(graph), revision: state.revision + 1, resetKey: state.resetKey + 1 };
  const visible = getVisibleIds(graph, state.expanded);
  let id = action.id;
  if (action.type === "STEP") {
    const index = visible.indexOf(state.selectedId);
    id = visible[Math.max(0, Math.min(visible.length - 1, index + Math.sign(action.direction)))];
  }
  if (action.type === "BACK") id = state.history[state.history.length - 1];
  if (!id || !graph.nodes[id] || !visible.includes(id) || id === state.selectedId) return state;
  const node = graph.nodes[id];
  return {
    ...state, selectedId: id,
    expanded: node.children.length && !state.expanded.includes(id) ? [...state.expanded, id] : state.expanded,
    history: action.type === "BACK" ? state.history.slice(0, -1) : [...state.history, state.selectedId],
    visited: state.visited.includes(id) ? state.visited : [...state.visited, id], revision: state.revision + 1,
  };
}

export function getNodeState(graph, state, id, hoveredId, ready = true) {
  if (!getVisibleIds(graph, state.expanded).includes(id)) return "hidden";
  if (!ready) return "inactive";
  if (state.selectedId === id) return "selected";
  if (hoveredId === id) return "hover";
  if (state.expanded.includes(id)) return "expanded";
  if (graph.nodes[state.selectedId].children.includes(id) || graph.nodes[state.selectedId].parentId === id) return "active";
  return "inactive";
}

export function getFocusIds(graph, selectedId) {
  const node = graph.nodes[selectedId];
  return [selectedId, ...node.children];
}
