"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { arrangeNodeLabels, getLabelWidth } from "@/utils/nodeLabels.mjs";

export default function GraphFallback({ graph, state, onSelect, onFocus, compact, loading }) {
  const selectedId = state.currentNode;
  const root = useRef();
  const [size, setSize] = useState({ width: 800, height: 500 });
  useEffect(() => {
    const element = root.current;
    const observer = new ResizeObserver(([entry]) => setSize({ width: entry.contentRect.width, height: entry.contentRect.height }));
    observer.observe(element); return () => observer.disconnect();
  }, []);
  const selected = graph.nodes[selectedId];
  const ids = [selectedId, ...selected.children];
  const layout = useMemo(() => {
    const points = ids.map(id => graph.nodes[id].position);
    const minX = Math.min(...points.map(p => p[0])) - 1, maxX = Math.max(...points.map(p => p[0])) + 1;
    const minY = Math.min(...points.map(p => p[1])) - 1, maxY = Math.max(...points.map(p => p[1])) + 1;
    const items = ids.map(id => {
      const p = graph.nodes[id].position;
      return { id, desiredX: (.12 + (p[0] - minX) / (maxX - minX) * .76) * size.width, desiredY: (.14 + (maxY - p[1]) / (maxY - minY) * .72) * size.height };
    });
    const rect = { left: 0, right: size.width, top: 0, bottom: size.height };
    const width = getLabelWidth(rect, items.length);
    arrangeNodeLabels(items, rect, width);
    return Object.fromEntries(items.map(item => [item.id, { x: item.x / size.width * 100, y: item.y / size.height * 100, width }]));
  // IDs are stable for a selected branch; derive the layout only when it changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graph, selectedId, size]);
  return <div ref={root} className={`graph-fallback ${compact ? "fallback-compact" : ""} ${loading ? "fallback-loading" : ""}`} aria-label={loading ? "Loading the 3D neural graph" : "Interactive projected neural graph"}>
    {ids.map(id => { const node = graph.nodes[id], point = layout[id], parent = layout[node.parentId]; const dx = parent ? (point.x - parent.x) * size.width / 100 : 0, dy = parent ? (point.y - parent.y) * size.height / 100 : 0; return <div key={id}>{parent && <div className="fallback-edge" style={{ left: `${parent.x.toFixed(5)}%`, top: `${parent.y.toFixed(5)}%`, width: `${Math.hypot(dx, dy).toFixed(4)}px`, transform: `rotate(${Math.atan2(dy, dx).toFixed(6)}rad)` }}><span /></div>}<button data-neural-id={id} className={`fallback-neuron ${node.depth === 0 ? "root-label" : node.depth === 1 ? "section-label" : "content-label"} ${id === selectedId ? "is-selected" : ""}`} type="button" style={{ left: `${point.x.toFixed(5)}%`, top: `${point.y.toFixed(5)}%`, width: point.width }} disabled={loading || state.isAnimating || !state.readyNodes.includes(id)} onClick={event => onSelect(id, event.detail === 0)} onFocus={() => onFocus(id)} onBlur={() => onFocus(null)} aria-pressed={id === selectedId}><i /><span>{node.label}</span></button></div>; })}
  </div>;
}
