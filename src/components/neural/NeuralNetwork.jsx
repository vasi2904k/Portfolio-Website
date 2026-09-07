"use client";
import dynamic from "next/dynamic";
import { Component, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortfolioGraph } from "@/data/neuralGraph";
import { compileGraph } from "@/utils/graphModel.mjs";
import useNeuralNetwork from "@/hooks/useNeuralNetwork";
import ContentOutput from "./ContentOutput";
import GraphFallback from "./GraphFallback";
const NeuralScene = dynamic(() => import("./NeuralScene"), { ssr: false, loading: () => null });

class GraphicsBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? null : this.props.children; }
}

export default function NeuralNetwork({ repos = [] }) {
  const graph = useMemo(() => compileGraph(createPortfolioGraph(repos)), [repos]);
  const network = useNeuralNetwork(graph);
  const { state, visibleIds, ancestors, select: dispatchSelect, reset: dispatchReset, back: dispatchBack } = network;
  const selected = graph.nodes[state.selectedId];
  const app = useRef(), outputRef = useRef(), tetherRef = useRef(), helpButton = useRef(), focusRequest = useRef(null);
  const wheel = useRef({ value: 0, last: 0 }), touch = useRef(null), suppressClick = useRef(0);
  const generation = useRef(state.resetKey), readyRef = useRef(new Set([graph.rootId]));
  generation.current = state.resetKey;
  const [readyIds, setReadyIds] = useState(() => new Set([graph.rootId]));
  const [mounted, setMounted] = useState(false), [ready, setReady] = useState(false), [failed, setFailed] = useState(false);
  const [compact, setCompact] = useState(true), [reduced, setReduced] = useState(true), [pageVisible, setPageVisible] = useState(true);
  const [touchDevice, setTouchDevice] = useState(false);
  const [paused, setPaused] = useState(false), [lightMode, setLightMode] = useState(false), [slow, setSlow] = useState(false);
  const [hoveredId, setHoveredId] = useState(null), [help, setHelp] = useState(false);
  const onReady = useCallback(() => setReady(true), []);
  const onFailure = useCallback(() => { setFailed(true); setReady(false); }, []);
  const onSlow = useCallback(() => setSlow(true), []);
  const onReveal = useCallback((id, key) => {
    if (key !== generation.current || readyRef.current.has(id)) return;
    readyRef.current.add(id); setReadyIds(new Set(readyRef.current));
  }, []);
  const select = useCallback((id) => {
    if (performance.now() < suppressClick.current || !readyRef.current.has(id)) return;
    focusRequest.current = id; setHoveredId(null); wheel.current.value = 0; dispatchSelect(id);
  }, [dispatchSelect]);
  const step = useCallback((direction) => {
    const index = visibleIds.indexOf(state.selectedId);
    const next = visibleIds[Math.max(0, Math.min(visibleIds.length - 1, index + direction))];
    select(next);
  }, [visibleIds, state.selectedId, select]);
  const reset = useCallback(() => {
    generation.current++;
    readyRef.current = new Set([graph.rootId]); setReadyIds(new Set(readyRef.current));
    wheel.current = { value: 0, last: 0 }; touch.current = null; suppressClick.current = 0;
    focusRequest.current = graph.rootId; setHoveredId(null); dispatchReset();
  }, [graph.rootId, dispatchReset]);
  const back = useCallback(() => { focusRequest.current = state.history[state.history.length - 1] || graph.rootId; wheel.current.value = 0; setHoveredId(null); dispatchBack(); }, [dispatchBack, state.history, graph.rootId]);
  const closeHelp = useCallback(() => { setHelp(false); helpButton.current?.focus(); }, []);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobile = window.matchMedia("(max-width: 760px) and (min-height: 501px)");
    const touchScreen = window.matchMedia("(pointer: coarse)");
    const update = () => { setReduced(motion.matches); setCompact(mobile.matches); setTouchDevice(touchScreen.matches); };
    update(); setMounted(true);
    motion.addEventListener("change", update); mobile.addEventListener("change", update); touchScreen.addEventListener("change", update);
    const visibility = () => setPageVisible(!document.hidden);
    visibility(); document.addEventListener("visibilitychange", visibility);
    return () => { motion.removeEventListener("change", update); mobile.removeEventListener("change", update); touchScreen.removeEventListener("change", update); document.removeEventListener("visibilitychange", visibility); };
  }, []);
  useEffect(() => { if (failed) { readyRef.current = new Set(visibleIds); setReadyIds(new Set(visibleIds)); } }, [failed, visibleIds]);
  useEffect(() => {
    if (focusRequest.current !== state.selectedId || !readyIds.has(state.selectedId) || failed) return;
    const frame = requestAnimationFrame(() => {
      const element = app.current?.querySelector(`[data-neural-id="${CSS.escape(state.selectedId)}"]`);
      if (element) { element.focus({ preventScroll: true }); focusRequest.current = null; }
    });
    return () => cancelAnimationFrame(frame);
  }, [state.selectedId, state.resetKey, readyIds, failed]);
  useEffect(() => {
    const element = app.current;
    const onWheel = event => {
      if (help || event.ctrlKey || event.metaKey || event.target.closest?.("[data-network-ui]")) return;
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      event.preventDefault();
      const now = performance.now();
      if (now - wheel.current.last < 950) return;
      const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1);
      if (Math.sign(delta) !== Math.sign(wheel.current.value)) wheel.current.value = 0;
      wheel.current.value += Math.max(-160, Math.min(160, delta));
      if (Math.abs(wheel.current.value) >= 100) { step(Math.sign(wheel.current.value)); wheel.current = { value: 0, last: now }; }
    };
    const keyboard = event => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (event.key === "Escape") { event.preventDefault(); if (help) closeHelp(); else back(); return; }
      if (help || event.target.closest?.("[data-network-ui],input,textarea,select,[contenteditable='true']")) return;
      if (["ArrowDown", "ArrowRight", "PageDown"].includes(event.key)) { event.preventDefault(); if (!event.repeat) step(1); }
      if (["ArrowUp", "ArrowLeft", "PageUp"].includes(event.key)) { event.preventDefault(); if (!event.repeat) step(-1); }
      if (event.key === "Home") { event.preventDefault(); reset(); }
    };
    element.addEventListener("wheel", onWheel, { passive: false }); window.addEventListener("keydown", keyboard);
    return () => { element.removeEventListener("wheel", onWheel); window.removeEventListener("keydown", keyboard); };
  }, [step, back, reset, help, closeHelp]);

  const touchStart = event => {
    if (event.pointerType !== "touch" || event.target.closest?.("[data-network-ui]")) return;
    if (!event.isPrimary) { touch.current = null; return; }
    touch.current = { x: event.clientX, y: event.clientY };
  };
  const touchEnd = event => {
    if (!touch.current) return;
    const dx = event.clientX - touch.current.x, dy = event.clientY - touch.current.y; touch.current = null;
    if (Math.abs(dy) > 45 && Math.abs(dy) > Math.abs(dx) * 1.1) { step(dy < 0 ? 1 : -1); suppressClick.current = performance.now() + 350; }
  };
  const moving = pageVisible && !reduced && !paused;
  const currentIndex = visibleIds.indexOf(state.selectedId);
  return <main ref={app} className={`neural-app ${ready ? "scene-ready" : ""} ${hoveredId ? "is-hovering" : ""} ${reduced || paused ? "motion-paused" : ""}`}>
    <div className="network-viewport" onPointerDown={touchStart} onPointerUp={touchEnd} onPointerCancel={() => { touch.current = null; }}>
      {(!ready || failed) && <GraphFallback graph={graph} selectedId={state.selectedId} compact={compact} onSelect={select} loading={!failed} />}
      {mounted && !failed && <GraphicsBoundary onFailure={onFailure}><NeuralScene graph={graph} state={state} visibleIds={visibleIds} readyIds={readyIds} hoveredId={hoveredId} onHover={setHoveredId} onSelect={select} onReveal={onReveal} onReady={onReady} onFailure={onFailure} onSlow={onSlow} moving={moving} reduced={reduced} compact={compact} lowQuality={lightMode || slow || touchDevice} outputRef={outputRef} tetherRef={tetherRef} /></GraphicsBoundary>}
    </div>
    <div className="network-atmosphere" aria-hidden="true" /><div className="network-vignette" aria-hidden="true" />
    <div ref={tetherRef} className="output-tether" aria-hidden="true" style={{ opacity: 0, display: ready && !failed ? undefined : "none" }}><i /></div>
    <header className="network-header" data-network-ui><button type="button" onClick={reset} className="network-brand" aria-label="Return to the origin and collapse the network">v<span>.</span></button><div className="network-identity">MOHAMMED VASI KHAN<span>MACHINE LEARNING ENGINEER</span></div><div className="network-tools"><button type="button" className={lightMode ? "is-active" : ""} aria-pressed={lightMode} onClick={() => setLightMode(!lightMode)} title="Use lighter graphics"><span className="quality-icon" aria-hidden="true">◈</span><span className="tool-text">Lite</span></button><button type="button" aria-pressed={paused || reduced} disabled={reduced} onClick={() => setPaused(!paused)} aria-label={reduced ? "Reduced motion is enabled by your system" : paused ? "Resume ambient motion" : "Pause ambient motion"} title={reduced ? "System reduced motion" : paused ? "Resume ambient motion" : "Pause ambient motion"}>{paused || reduced ? "▷" : "Ⅱ"}</button><button ref={helpButton} type="button" onClick={() => setHelp(!help)} aria-expanded={help} aria-controls="network-help" aria-label="How to explore">?</button></div></header>
    <div className="network-location" data-network-ui aria-label="Current neural pathway">{ancestors.map((id, index) => <span key={id}>{index > 0 && <i aria-hidden="true">/</i>}<button type="button" onClick={() => select(id)} aria-current={id === state.selectedId ? "location" : undefined}>{id === graph.rootId ? "THE ORIGIN" : graph.nodes[id].label.toUpperCase()}</button></span>)}</div>
    <div className="network-caption" aria-hidden="true"><span className="caption-dash" /><span>{state.selectedId === graph.rootId ? "A PORTFOLIO, CONNECTED." : `FOLLOWING ${selected.label.toUpperCase()}.`}</span></div>
    <ContentOutput graph={graph} node={selected} outputRef={outputRef} readyIds={readyIds} reduced={reduced} visited={state.visited} onReset={reset} resetKey={state.resetKey} />
    <footer className="network-bottom" data-network-ui><div className="travel-controls"><button type="button" onClick={back} disabled={!state.history.length} aria-label="Return to previously visited node" title="Go back">↶</button><button type="button" onClick={reset} aria-label="Collapse network and return to origin" title="Return to origin">◎</button><span className="travel-divider" /><button type="button" onClick={() => step(-1)} disabled={currentIndex === 0} aria-label="Follow previous connection" title="Previous connection">↑</button><button type="button" onClick={() => step(1)} disabled={currentIndex === visibleIds.length - 1 || !readyIds.has(visibleIds[currentIndex + 1])} aria-label="Follow next connection" title="Next connection">↓</button></div><div className="travel-hint"><span className="scroll-mark" aria-hidden="true" /><span>{touchDevice || compact ? "SWIPE TO TRAVEL" : "SCROLL TO FOLLOW A CONNECTION"}<small>{touchDevice || compact ? "TAP A NEURON TO EXPLORE" : "OR SELECT A NEURON TO EXPLORE"}</small></span></div><div className="network-progress"><span>{String(state.visited.length).padStart(2, "0")}<i> / {String(graph.order.length).padStart(2, "0")}</i></span><div role="progressbar" aria-label="Nodes explored" aria-valuemin={0} aria-valuemax={graph.order.length} aria-valuenow={state.visited.length}><i style={{ transform: `scaleX(${state.visited.length / graph.order.length})` }} /></div><small>CONNECTIONS EXPLORED</small></div></footer>
    <p className="network-live sr-only" role="status" aria-live="polite">{selected.label}. {selected.children.length ? `${selected.children.length} connections available.` : "Content revealed."}</p>
    {failed && <div className="fallback-notice" role="status">3D is unavailable on this device. Explore the connected map.</div>}
    {help && <div id="network-help" className="network-help" role="dialog" aria-label="How to explore the network" data-network-ui><div className="help-top"><span>FOLLOW YOUR CURIOSITY</span><button type="button" onClick={closeHelp} aria-label="Close exploration help">×</button></div><h2>The network is<br />your navigation.</h2><p>Select a neuron to open its story and reveal the pathways connected to it.</p><dl><div><dt>Scroll / swipe</dt><dd>Travel to the next connection</dd></div><div><dt>Click / tap</dt><dd>Explore a particular neuron</dd></div><div><dt>Arrow keys</dt><dd>Move through the network</dd></div><div><dt>Tab + Enter</dt><dd>Focus and select a neuron</dd></div><div><dt>Escape / ↶</dt><dd>Return to your previous node</dd></div><div><dt>Home / ◎</dt><dd>Collapse and return to the origin</dd></div></dl><p className="help-note">Scroll inside the output panel to read longer stories. Pause controls stop ambient motion; navigation stays available.</p></div>}
    <noscript><div className="javascript-note">Enable JavaScript to explore the interactive network. Contact Mohammed Vasi Khan at <a href="mailto:vk64375@gmail.com">vk64375@gmail.com</a>.</div></noscript>
  </main>;
}
