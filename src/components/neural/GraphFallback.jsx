"use client";
import { useEffect, useMemo, useRef, useState } from "react";

export default function GraphFallback({ graph, selectedId, onSelect, compact, loading }) {
  const root = useRef();
  const [size, setSize] = useState({ width: 800, height: 500 });
  useEffect(() => {
    const element = root.current;
    const observer = new ResizeObserver(([entry]) => setSize({ width: entry.contentRect.width, height: entry.contentRect.height }));
    observer.observe(element); return () => observer.disconnect();
  }, []);
  const selected = graph.nodes[selectedId];
  const ids = [...new Set([...(selected.parentId ? [selected.parentId] : []), selectedId, ...selected.children])];
  const layout = useMemo(() => {
    const points = ids.map(id => graph.nodes[id].position);
    const minX = Math.min(...points.map(p => p[0])) - 1, maxX = Math.max(...points.map(p => p[0])) + 1;
    const minY = Math.min(...points.map(p => p[1])) - 1, maxY = Math.max(...points.map(p => p[1])) + 1;
    return Object.fromEntries(ids.map(id => {
      const p = graph.nodes[id].position;
      return [id, { x: 12 + (p[0] - minX) / (maxX - minX) * 76, y: 14 + (maxY - p[1]) / (maxY - minY) * 72 }];
    }));
  // IDs are stable for a selected branch; derive the layout only when it changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graph, selectedId]);
  return <div ref={root} className={`graph-fallback ${compact ? "fallback-compact" : ""} ${loading ? "fallback-loading" : ""}`} aria-label={loading ? "Loading the 3D neural graph" : "Interactive projected neural graph"}>
    {ids.map(id => { const node = graph.nodes[id], point = layout[id], parent = layout[node.parentId]; const dx = parent ? (point.x - parent.x) * size.width / 100 : 0, dy = parent ? (point.y - parent.y) * size.height / 100 : 0; return <div key={id}>{parent && <div className="fallback-edge" style={{ left: `${parent.x}%`, top: `${parent.y}%`, width: `${Math.hypot(dx, dy)}px`, transform: `rotate(${Math.atan2(dy, dx)}rad)` }}><span /></div>}<button className={`fallback-neuron ${id === selectedId ? "is-selected" : ""}`} type="button" style={{ left: `${point.x}%`, top: `${point.y}%` }} disabled={loading} onClick={() => onSelect(id)} aria-pressed={id === selectedId}><i /><span>{node.label}</span></button></div>; })}
  </div>;
}
