"use client";
import dynamic from "next/dynamic";
import { Component, useCallback, useEffect, useRef, useState } from "react";

const NeuralCanvas = dynamic(() => import("@/components/NeuralCanvas"), { ssr: false, loading: () => null });
const layers = [
  { label: "All layers", title: "CONNECTED BY CURIOSITY.", description: "A living network of ideas. Drag to orbit, or select a layer to follow the flow." },
  { label: "Input", title: "01 / INPUT LAYER", description: "Every prediction starts with data. Input neurons receive the features that describe a problem." },
  { label: "Hidden", title: "02 / HIDDEN LAYERS", description: "Weighted connections and activation functions transform features into learned representations." },
  { label: "Output", title: "03 / OUTPUT LAYER", description: "The final layer turns learned representations into a prediction, score, or decision." },
];

class NeuralBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? null : this.props.children; }
}

export default function NeuralExperience() {
  const root = useRef(null), rotation = useRef(0), drag = useRef(null);
  const [ready, setReady] = useState(false), [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(true), [pageVisible, setPageVisible] = useState(true);
  const [compact, setCompact] = useState(true), [reduced, setReduced] = useState(true);
  const [paused, setPaused] = useState(false), [layer, setLayer] = useState(0), [failed, setFailed] = useState(false);
  const onReady = useCallback(() => setReady(true), []);
  const onFailure = useCallback(() => { setFailed(true); setReady(false); }, []);
  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobile = window.matchMedia("(max-width: 760px), (pointer: coarse)");
    const update = () => { setReduced(motion.matches); setCompact(mobile.matches); };
    update(); motion.addEventListener("change", update); mobile.addEventListener("change", update);
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: "80px" });
    observer.observe(root.current);
    const visibility = () => setPageVisible(!document.hidden);
    visibility(); document.addEventListener("visibilitychange", visibility);
    const canvas = document.createElement("canvas");
    try {
      const gl = canvas.getContext("webgl2");
      if (gl) { gl.getExtension("WEBGL_lose_context")?.loseContext(); setEnabled(true); }
      else setFailed(true);
    } catch { setFailed(true); }
    return () => { observer.disconnect(); motion.removeEventListener("change", update); mobile.removeEventListener("change", update); document.removeEventListener("visibilitychange", visibility); };
  }, []);
  const moving = visible && pageVisible && !paused && !reduced;
  const rotate = (amount) => { rotation.current += amount; root.current?.dispatchEvent(new Event("neural-rotate")); };
  return (
    <div ref={root} className={`neural-experience ${ready && !failed ? "neural-ready" : ""}`}>
      <div className="neural-halo" aria-hidden="true" />
      <div className="neural-fallback" aria-hidden="true"><div className="fallback-web">{Array.from({ length: 12 }, (_, i) => <i key={i} style={{ "--ring-angle": `${i * 15}deg` }} />)}<span /></div><div className="fallback-floor" /></div>
      <div className="neural-render" role="img" aria-label="Interactive three-dimensional neural network with connected input, hidden, and output neurons above a futuristic city grid"
        onPointerDown={(event) => { if (event.button === 0) drag.current = { x: event.clientX, rotation: rotation.current }; }}
        onPointerMove={(event) => { if (!drag.current) return; rotation.current = drag.current.rotation + (event.clientX - drag.current.x) * .006; root.current?.dispatchEvent(new Event("neural-rotate")); }}
        onPointerUp={() => { drag.current = null; }} onPointerLeave={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }}>
        {enabled && !failed && <NeuralBoundary onFailure={onFailure}><NeuralCanvas moving={moving} compact={compact} reduced={reduced} layer={layer} rotation={rotation} eventRoot={root} onReady={onReady} onFailure={onFailure} onSelectLayer={setLayer} /></NeuralBoundary>}
      </div>
      <div className="neural-label mono"><span className="status-dot" /> THE NEURAL DISTRICT <span className="label-line" /></div>
      <div className="neural-hud mono"><span className="hud-cross">+</span><span>IDEAS CONNECT.<br /><strong>INTELLIGENCE EMERGES.</strong></span></div>
      <div className="network-annotation annotation-input mono" aria-hidden="true">01 / INPUT<span /></div>
      <div className="network-annotation annotation-output mono" aria-hidden="true"><span />OUTPUT / 03</div>
      <div className="neural-controls">
        <div className="layer-switch" aria-label="Explore neural network layers">{layers.map((item, index) => <button type="button" key={item.label} aria-pressed={layer === index} onClick={() => setLayer(index)}>{item.label}</button>)}</div>
        <div className="orbit-controls"><button type="button" title="Rotate network left" aria-label="Rotate neural network left" disabled={!ready || failed} onClick={() => rotate(-.4)}>↶</button><button type="button" title="Rotate network right" aria-label="Rotate neural network right" disabled={!ready || failed} onClick={() => rotate(.4)}>↷</button><button type="button" title={paused ? "Play animation" : "Pause animation"} aria-label={paused ? "Play neural animation" : "Pause neural animation"} aria-pressed={paused || reduced} disabled={reduced || failed || !ready} onClick={() => setPaused(!paused)}>{paused || reduced ? "▷" : "Ⅱ"}</button></div>
      </div>
      <div className="network-caption" aria-live="polite"><span className="mono">{layers[layer].title}</span><p>{layers[layer].description}</p></div>
      <p className="neural-hint mono">{failed ? "NETWORK PREVIEW / STATIC MODE" : reduced ? "REDUCED MOTION / ROTATE TO EXPLORE" : ready ? "DRAG TO ORBIT · SELECT A NEURON TO EXPLORE" : "INITIALIZING NEURAL NETWORK…"}</p>
    </div>
  );
}
