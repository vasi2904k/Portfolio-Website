"use client";
import dynamic from "next/dynamic";
import { Component, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortfolioGraph } from "@/data/neuralGraph";
import { compileGraph } from "@/utils/graphModel.mjs";
import { consumeWheel, createWheelGesture, cycleAvailable } from "@/utils/navigationInput.mjs";
import useNeuralNetwork from "@/hooks/useNeuralNetwork";
import useSceneGestures from "@/hooks/useSceneGestures";
import { NEURAL_PALETTES } from "@/config/neuralPalette.mjs";
import ContentOutput from "./ContentOutput";
import GraphFallback from "./GraphFallback";
import NavigationOverview from "./NavigationOverview";
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
  const { state, visibleIds, readyIds, availableIds, nextNode, cameraStarted, cameraSettled, cameraPose, reveal, hover, focus, select: dispatchSelect, step: dispatchStep, back: dispatchBack, reset: dispatchReset, recenter: dispatchRecenter } = network;
  const selected = graph.nodes[state.currentNode];
  const app = useRef(), outputRef = useRef(), tetherRef = useRef(), helpButton = useRef(), mapButton = useRef(), breadcrumb = useRef();
  const wheel = useRef(createWheelGesture()), viewportRef = useRef(), cameraApi = useRef(), cancelInput = useRef(() => {});
  const focusRequest = useRef(false), inputLock = useRef(true);
  const [mounted, setMounted] = useState(false), [ready, setReady] = useState(false), [failed, setFailed] = useState(false);
  const [compact, setCompact] = useState(true), [reduced, setReduced] = useState(true), [pageVisible, setPageVisible] = useState(true);
  const [touchDevice, setTouchDevice] = useState(false);
  const [paused, setPaused] = useState(false), [lightMode, setLightMode] = useState(false), [slow, setSlow] = useState(false);
  const [help, setHelp] = useState(false), [overview, setOverview] = useState(false);
  const [storyNode, setStoryNode] = useState(null);
  const panelExpanded = !selected.children.length || storyNode === state.currentNode;
  const [learned, setLearned] = useState(false), [wheelMode, setWheelMode] = useState("zoom"), [travelMode, setTravelMode] = useState(false);
  const [theme, setTheme] = useState("green");
  const palette = NEURAL_PALETTES[theme];
  const onInteraction = useCallback(() => setLearned(true), []);
  const [feedback, setFeedback] = useState("");
  const feedbackTimer = useRef();
  const onReady = useCallback(() => setReady(true), []);
  const onFailure = useCallback(() => { setFailed(true); setReady(false); }, []);
  const onSlow = useCallback(() => setSlow(true), []);
  const announce = useCallback(message => {
    clearTimeout(feedbackTimer.current); setFeedback(message);
    feedbackTimer.current = setTimeout(() => setFeedback(""), 2200);
  }, []);
  useEffect(() => () => clearTimeout(feedbackTimer.current), []);
  useEffect(() => { inputLock.current = state.isAnimating; }, [state.isAnimating]);

  const begin = useCallback((action, keyboard = false, force = false) => {
    if (inputLock.current && !force) return false;
    inputLock.current = true;
    cancelInput.current(); cameraApi.current?.cancelMotion();
    if (keyboard) focusRequest.current = true;
    wheel.current.value = 0;
    action();
    return true;
  }, []);
  const select = useCallback((id, keyboard = false) => {
    if (!readyIds.has(id) || id === state.currentNode) return;
    if (begin(() => dispatchSelect(id), keyboard)) setLearned(true);
  }, [begin, dispatchSelect, readyIds, state.currentNode]);
  const back = useCallback((keyboard = false) => {
    if (!state.parentNode) { announce("You are at ROOT. Choose a connected neuron."); return; }
    begin(dispatchBack, keyboard);
  }, [begin, dispatchBack, state.parentNode, announce]);
  const reset = useCallback((keyboard = false) => begin(dispatchReset, keyboard), [begin, dispatchReset]);
  const recenter = useCallback((quiet = false) => {
    if (begin(dispatchRecenter, false, true) && !quiet) announce("Recentering on " + selected.label);
  }, [begin, dispatchRecenter, announce, selected.label]);
  const recover = useCallback(() => recenter(true), [recenter]);
  const focusNeuron = useCallback(id => { if (id === state.currentNode) recenter(); else select(id); }, [state.currentNode, recenter, select]);
  const step = useCallback((direction, keyboard = false) => {
    if (inputLock.current) return;
    const id = direction < 0 ? state.parentNode : nextNode;
    if (!id) { announce(direction < 0 ? "You are at ROOT. Choose a neuron." : "Path complete. Use BACK to choose another connection."); return; }
    if (begin(() => dispatchStep(direction), keyboard)) {
      setLearned(true);
      announce((direction < 0 ? "↑ Back to " : "↓ Exploring ") + graph.nodes[id].label);
    }
  }, [begin, dispatchStep, state.parentNode, nextNode, announce, graph]);
  const gestures = useSceneGestures({ locked: state.isAnimating, suspended: help || overview, travelMode,
    onActivate: select, onFocusNode: focusNeuron, onTravel: step, onPreview: hover, onInteraction, onTouch: () => setTouchDevice(true) });
  cancelInput.current = gestures.cancel;
  useEffect(() => { if (!ready) return; const timer = setTimeout(() => setLearned(true), 12000); return () => clearTimeout(timer); }, [ready]);
  const closeHelp = useCallback(() => { setHelp(false); helpButton.current?.focus(); }, []);
  const closeOverview = useCallback(() => { setOverview(false); mapButton.current?.focus(); }, []);
  useEffect(() => { breadcrumb.current?.lastElementChild?.scrollIntoView({ block: "nearest", inline: "end" }); }, [state.currentNode]);

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

  // The non-WebGL renderer participates in exactly the same transaction.
  useEffect(() => {
    if (!failed) return;
    if (["SELECT", "BACK", "CAMERA_FOCUS"].includes(state.phase)) cameraSettled(state.revision);
    else if (state.phase === "EXPAND_BRANCH") visibleIds.forEach(id => reveal(id, state.revision));
  }, [failed, state.phase, state.revision, visibleIds, cameraSettled, reveal]);
  useEffect(() => {
    if (state.isAnimating || !focusRequest.current) return;
    const frame = requestAnimationFrame(() => {
      const id = typeof focusRequest.current === "string" ? focusRequest.current : state.currentNode;
      const element = app.current?.querySelector('[data-neural-id="' + CSS.escape(id) + '"]');
      element?.focus({ preventScroll: true }); focusRequest.current = false;
    });
    return () => cancelAnimationFrame(frame);
  }, [state.isAnimating, state.currentNode]);

  useEffect(() => {
    const element = app.current;
    const onWheel = event => {
      if (help || overview || event.metaKey || event.target.closest?.("[data-network-ui]")) return;
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      event.preventDefault(); event.stopPropagation();
      const route = !event.ctrlKey && (wheelMode === "travel" || event.shiftKey);
      if (route) {
        const direction = consumeWheel(wheel.current, event.deltaY, performance.now(), inputLock.current, event.deltaMode, window.innerHeight);
        if (direction) step(direction);
      } else {
        const normalized = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1);
        cameraApi.current?.zoom(normalized * (event.ctrlKey ? 4 : 1));
      }
    };
    const keyboard = event => {
      if (event.ctrlKey || event.metaKey || event.altKey || event.target.closest?.("input,textarea,select,[contenteditable='true']")) return;
      if (event.key === "Escape") {
        event.preventDefault();
        if (help) closeHelp(); else if (overview) closeOverview(); else if (!event.repeat) back(true);
        return;
      }
      if (help || overview) return;
      if (["+", "=", "-", "_"].includes(event.key)) { event.preventDefault(); cameraApi.current?.zoom(event.key === "+" || event.key === "=" ? -100 : 100); return; }
      if (event.key.toLowerCase() === "r" && !event.repeat) { event.preventDefault(); recenter(); return; }
      if (event.target.closest?.("[data-network-ui]")) return;
      if (["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft"].includes(event.key)) {
        event.preventDefault();
        if (inputLock.current || event.repeat) return;
        const direction = ["ArrowDown", "ArrowRight"].includes(event.key) ? 1 : -1;
        const current = event.target.dataset?.neuralId || state.focusedNode || state.currentNode;
        const id = cycleAvailable(availableIds, current, direction);
        const closingStory = compact && panelExpanded && selected.children.length;
        if (closingStory) { focusRequest.current = id; setStoryNode(null); }
        focus(id);
        if (!closingStory) app.current?.querySelector('[data-neural-id="' + CSS.escape(id) + '"]')?.focus({ preventScroll: true });
      }
      if (event.key === "Enter" && !event.target.closest?.("button,a")) { event.preventDefault(); select(state.focusedNode || state.currentNode, true); }
      if (event.key === "PageDown" || event.key === "PageUp") { event.preventDefault(); if (!event.repeat) step(event.key === "PageDown" ? 1 : -1, true); }
      if (event.key === "Home") { event.preventDefault(); if (!event.repeat) reset(true); }
      if (event.key.toLowerCase() === "r" && !event.repeat) { event.preventDefault(); recenter(); }
    };
    element.addEventListener("wheel", onWheel, { passive: false, capture: true }); window.addEventListener("keydown", keyboard);
    return () => { element.removeEventListener("wheel", onWheel, { capture: true }); window.removeEventListener("keydown", keyboard); };
  }, [step, back, reset, recenter, select, focus, availableIds, state.currentNode, state.focusedNode, help, overview, closeHelp, closeOverview, compact, panelExpanded, selected.children.length, wheelMode]);

  const moving = pageVisible && !reduced && !paused;
  const highlighted = state.focusedNode || state.hoveredNode;
  const phaseLabel = state.phase === "EXPAND_BRANCH" ? "Opening connections…" : state.isAnimating ? "Focusing " + selected.label + "…" : "";
  return <main ref={app} tabIndex={-1} className={"neural-app " + (ready ? "scene-ready " : "") + (highlighted ? "is-hovering " : "") + (state.isAnimating ? "is-navigating " : "") + (reduced || paused ? "motion-paused" : "")} data-current-node={state.currentNode} data-navigation-phase={state.phase} data-navigation-depth={state.navigationDepth} data-camera-position={state.cameraPosition.join(",")} data-camera-target={state.cameraTarget.join(",")} data-theme={theme} style={{ "--neural-accent": palette.signal, "--neural-text": palette.text, "--neural-muted": palette.muted, "--neural-panel": palette.panel, "--neural-border": palette.border, "--neural-background": palette.background }}>
    <div ref={viewportRef} className="network-viewport" inert={help || overview ? "" : undefined} {...gestures.handlers}>
      {(!ready || failed) && <GraphFallback graph={graph} state={state} compact={compact} onSelect={gestures.activate} onFocus={focus} loading={!failed} />}
      {mounted && !failed && <GraphicsBoundary onFailure={onFailure}><NeuralScene graph={graph} state={state} visibleIds={visibleIds} readyIds={readyIds} hoveredId={highlighted} onHover={hover} onFocus={focus} onSelect={gestures.activate} onNodePress={gestures.pressNode} onReveal={reveal} onCameraStarted={cameraStarted} onCameraSettled={cameraSettled} onCameraPose={cameraPose} onRecenter={recover} viewportRef={viewportRef} cameraApi={cameraApi} travelMode={travelMode} suspended={help || overview} onInteraction={onInteraction} palette={palette} touchDevice={touchDevice} panelExpanded={panelExpanded} onReady={onReady} onFailure={onFailure} onSlow={onSlow} moving={moving} reduced={reduced} compact={compact} qualityName={lightMode || slow ? "lite" : touchDevice || compact ? "mobile" : "desktop"} outputRef={outputRef} tetherRef={tetherRef} /></GraphicsBoundary>}
    </div>
    <div className="network-atmosphere" aria-hidden="true" /><div className="network-vignette" aria-hidden="true" />
    <div ref={tetherRef} className="output-tether" aria-hidden="true" style={{ opacity: 0, display: ready && !failed ? undefined : "none" }}><i /></div>
    <header className="network-header" data-network-ui>
      <button type="button" onClick={() => reset()} disabled={state.isAnimating} className="network-brand" aria-label="Return to root">v<span>.</span></button>
      <div className="network-identity">MOHAMMED VASI KHAN<span>MACHINE LEARNING ENGINEER</span></div>
      <div className="network-tools">
        {!compact && <button type="button" className={lightMode ? "is-active" : ""} aria-pressed={lightMode} onClick={() => setLightMode(!lightMode)} aria-label="Use lighter graphics"><span className="quality-icon" aria-hidden="true">◈</span><span className="tool-text">Lite</span></button>}
        <button type="button" className="theme-toggle" onClick={() => setTheme(theme === "green" ? "blue" : "green")} aria-label={theme === "green" ? "Switch to blue and silver theme" : "Switch to neural green theme"} title="Change neural palette"><span aria-hidden="true">◐</span></button>
        <button type="button" aria-pressed={paused || reduced} disabled={reduced} onClick={() => setPaused(!paused)} aria-label={reduced ? "System reduced motion is enabled" : paused ? "Resume ambient motion" : "Pause ambient motion"}>{paused || reduced ? "▷" : "Ⅱ"}</button>
        <button ref={helpButton} type="button" onClick={() => { setHelp(!help); setOverview(false); }} aria-expanded={help} aria-controls="network-help" aria-label="How to explore">?</button>
      </div>
    </header>
    <nav ref={breadcrumb} className="network-location" data-network-ui aria-label="Current neural pathway">
      {state.activePath.map((id, index) => <span key={id}>{index > 0 && <i aria-hidden="true">/</i>}<button type="button" disabled={state.isAnimating} onClick={() => select(id)} aria-current={id === state.currentNode ? "location" : undefined} title={graph.nodes[id].label}>{id === graph.rootId ? "ROOT" : graph.nodes[id].label.toUpperCase()}</button></span>)}
    </nav>
    <div className="network-caption"><span className="caption-dash" /><span>{state.currentNode === graph.rootId ? "A PORTFOLIO, CONNECTED." : "FOLLOWING " + selected.label.toUpperCase() + "."}</span></div>
    <ContentOutput graph={graph} node={graph.nodes[state.contentNode]} outputRef={outputRef} readyIds={readyIds} reduced={reduced} visited={state.visited} onReset={() => reset()} onBack={() => back()} isAnimating={state.isAnimating} phaseLabel={phaseLabel} resetKey={state.resetKey} compact={compact} panelExpanded={panelExpanded} onToggleStory={() => setStoryNode(panelExpanded ? null : state.currentNode)} />
    <footer className="network-bottom" data-network-ui>
      <div className="travel-controls" aria-label="Network navigation">
        <button type="button" onClick={() => back()} disabled={state.isAnimating || !state.parentNode} aria-label={state.parentNode ? "Back to " + graph.nodes[state.parentNode].label : "Back, already at root"}>← <span>BACK</span></button>
        <button type="button" onClick={() => reset()} disabled={state.isAnimating}>⌂ <span>ROOT</span></button>
        <button type="button" onClick={() => recenter()}>◎ <span>RECENTER</span></button>
      </div>
      <div className="camera-mode-tools">
        <div className="gesture-mode" role="group" aria-label={touchDevice ? "One-finger gesture mode" : "Mouse wheel mode"}>
          <button type="button" aria-pressed={touchDevice ? !travelMode : wheelMode === "zoom"} onClick={() => { if (touchDevice) setTravelMode(false); else setWheelMode("zoom"); wheel.current = createWheelGesture(); announce(touchDevice ? "Drag to explore · Pinch to zoom" : "Wheel zooms · Shift + wheel travels"); }}>{touchDevice ? "EXPLORE" : "ZOOM"}</button>
          <button type="button" aria-pressed={touchDevice ? travelMode : wheelMode === "travel"} onClick={() => { if (touchDevice) setTravelMode(true); else setWheelMode("travel"); wheel.current = createWheelGesture(); announce(touchDevice ? "Swipe up: deeper · Swipe down: back" : "Scroll down: deeper · Scroll up: back"); }}>TRAVEL</button>
        </div>
        <div className="zoom-controls" role="group" aria-label="Camera zoom">
          <button type="button" disabled={state.isAnimating || failed} onClick={() => cameraApi.current?.zoom(100)} aria-label="Zoom out">−</button>
          <button type="button" disabled={state.isAnimating || failed} onClick={() => cameraApi.current?.zoom(-100)} aria-label="Zoom in">+</button>
        </div>
      </div>
      <div className="network-orientation-tools">
        <button type="button" className="deeper-control" disabled={state.isAnimating || !nextNode} onClick={() => step(1)} aria-label={nextNode ? "Move deeper to " + graph.nodes[nextNode].label : "End of this path"} title={nextNode ? "Next: " + graph.nodes[nextNode].label : "Use Back to explore another connection"}>↓ <span>{nextNode ? "DEEPER" : "PATH COMPLETE"}</span></button>
        <button ref={mapButton} type="button" className="map-toggle" onClick={() => { setOverview(!overview); setHelp(false); }} aria-expanded={overview} aria-controls="network-overview">⌘ <span>MAP</span><small>{state.visited.length}/{graph.order.length}</small></button>
      </div>
    </footer>
    <div className={"scene-instructions " + (learned ? "instructions-learned" : "")} aria-hidden={learned}>
      <span>{touchDevice || compact ? "SWIPE · EXPLORE" : "DRAG · EXPLORE"}</span><span>{touchDevice || compact ? "PINCH · ZOOM" : "SCROLL · ZOOM / TRAVEL"}</span><span>{touchDevice || compact ? "TAP · ACTIVATE" : "CLICK · ACTIVATE"}</span>
    </div>
    <div className={"travel-feedback " + (!learned ? "feedback-initial" : "")} role="status" aria-live="polite">{phaseLabel || feedback || (!nextNode && !state.isAnimating ? "Path complete · Go Back to explore another connection" : "")}</div>
    <p className="network-live sr-only" role="status" aria-live="polite">{!state.isAnimating && (state.activePath.map(id => id === graph.rootId ? "Root" : graph.nodes[id].label).join(" / ") + ". " + (selected.children.length ? selected.children.length + " connections available. Arrow keys move focus; Enter selects." : "Content revealed. Escape goes back."))}</p>
    {failed && <div className="fallback-notice" role="status">3D is unavailable. The connected map and keyboard navigation are ready.</div>}
    {overview && <NavigationOverview graph={graph} state={state} onSelect={id => { select(id, true); closeOverview(); }} onClose={closeOverview} />}
    {help && <div id="network-help" className="network-help" role="dialog" aria-label="How to explore the network" data-network-ui>
      <div className="help-top"><span>FOLLOW YOUR CURIOSITY</span><button type="button" autoFocus onClick={closeHelp} aria-label="Close exploration help">×</button></div>
      <h2>The network is<br />your navigation.</h2><p>Glowing neurons are available. Select one to focus its story and grow its connections. ROOT and the breadcrumb always show your location.</p>
      <dl><div><dt>Drag / one finger</dt><dd>Orbit in Explore mode</dd></div><div><dt>Wheel / pinch / + −</dt><dd>Zoom within the branch limits</dd></div><div><dt>Two-finger drag</dt><dd>Pan nearby; the branch stays close</dd></div><div><dt>Travel mode</dt><dd>Wheel down or swipe up: deeper. Wheel up or swipe down: back.</dd></div><div><dt>Click / tap</dt><dd>Activate a neuron and reveal its branch</dd></div><div><dt>Double click / tap</dt><dd>Focus a neuron</dd></div><div><dt>Arrow keys / Enter</dt><dd>Focus available labels / activate</dd></div><div><dt>Escape / Back</dt><dd>Return to the parent</dd></div><div><dt>Home / Root</dt><dd>Return to ROOT</dd></div><div><dt>R / Recenter</dt><dd>Restore this branch at any time</dd></div></dl>
      <button type="button" className="help-quality" aria-pressed={lightMode} onClick={() => setLightMode(!lightMode)}>{lightMode ? "Lite environment enabled" : "Use a lighter environment"}</button>
      <p className="help-note">Shift + wheel temporarily travels. Scroll inside the output panel to read. A pathway locks briefly while it opens. At the end of a path, use Back to choose another neuron.</p>
    </div>}
    <noscript><div className="javascript-note">Enable JavaScript to explore the interactive network. Contact Mohammed Vasi Khan at <a href="mailto:vk64375@gmail.com">vk64375@gmail.com</a>.</div></noscript>
  </main>;
}
