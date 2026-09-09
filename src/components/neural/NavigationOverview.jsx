"use client";
import { getVisibleIds } from "@/utils/graphModel.mjs";

export default function NavigationOverview({ graph, state, onSelect, onClose }) {
  const visible = new Set(getVisibleIds(graph, state.expandedNodes));
  function branch(id) {
    const node = graph.nodes[id], current = id === state.currentNode;
    return <li key={id}>
      <button type="button" disabled={state.isAnimating || !state.readyNodes.includes(id)} onClick={() => onSelect(id)} aria-current={current ? "location" : undefined} className={state.activePath.includes(id) ? "on-path" : ""}>
        <i aria-hidden="true" /> <span>{id === graph.rootId ? "ROOT" : node.label}</span>{current && <small>YOU ARE HERE</small>}
      </button>
      {node.children.length > 0 && visible.has(node.children[0]) && <ul>{node.children.map(branch)}</ul>}
    </li>;
  }
  return <section id="network-overview" className="network-overview" data-network-ui role="dialog" aria-label="Network overview and accessible navigation">
    <div className="help-top"><span>NETWORK MAP</span><button type="button" autoFocus onClick={onClose} aria-label="Close network map">×</button></div>
    <p>Choose a branch to reveal its children. Your active path is highlighted.</p>
    <nav aria-label="Accessible network outline"><ul>{branch(graph.rootId)}</ul></nav>
    <div className="overview-progress">{state.visited.length} of {graph.order.length} neurons explored <progress aria-label="Neurons explored" value={state.visited.length} max={graph.order.length} /></div>
  </section>;
}
