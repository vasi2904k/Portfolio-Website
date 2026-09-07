"use client";
import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { SphereGeometry, TorusGeometry, Vector3 } from "three";
import { gsap } from "gsap";
import useCameraAnimation from "@/hooks/useCameraAnimation";
import { getNodeState } from "@/utils/graphModel.mjs";
import { connectionPoints } from "@/utils/neuralCurves";
import NeuralNode from "./NeuralNode";
import NeuralConnection from "./NeuralConnection";
import NeuralParticles, { AmbientParticles } from "./NeuralParticles";

function CameraRig(props) { useCameraAnimation(props); return null; }
function GraphWorld({ graph, state, visibleIds, readyIds, hoveredId, onHover, onSelect, onReveal, moving, reduced, compact }) {
  const { invalidate } = useThree();
  const runtimes = useMemo(() => new Map(), []);
  const sphere = useMemo(() => new SphereGeometry(1, 18, 14), []);
  const ring = useMemo(() => new TorusGeometry(1, .008, 3, 64), []);
  visibleIds.forEach(id => { if (!runtimes.has(id)) runtimes.set(id, { growth: id === graph.rootId ? 1 : 0, spawn: id === graph.rootId ? 1 : 0 }); });
  const connections = useMemo(() => graph.edges.filter(edge => visibleIds.includes(edge.to)).map(edge => ({ ...edge, points: connectionPoints(graph.nodes[edge.from].position, graph.nodes[edge.to].position) })), [graph, visibleIds]);
  useEffect(() => {
    const timelines = [];
    visibleIds.forEach(id => {
      const runtime = runtimes.get(id);
      if (runtime.spawn >= 1) { onReveal(id, state.resetKey); return; }
      const node = graph.nodes[id], siblings = graph.nodes[node.parentId]?.children || [];
      const delay = reduced ? 0 : siblings.indexOf(id) * .13;
      if (reduced) { runtime.growth = 1; runtime.spawn = 1; onReveal(id, state.resetKey); invalidate(); return; }
      const timeline = gsap.timeline({ delay, onUpdate: invalidate, onComplete: () => onReveal(id, state.resetKey) });
      timeline.to(runtime, { growth: 1, duration: .62 * (1 - runtime.growth), ease: "power2.inOut" }).to(runtime, { spawn: 1, duration: .32, ease: "back.out(1.3)" });
      timelines.push(timeline);
    });
    invalidate();
    return () => timelines.forEach(timeline => timeline.kill());
  }, [graph, visibleIds, reduced, runtimes, invalidate, onReveal, state.resetKey]);
  useEffect(() => () => { sphere.dispose(); ring.dispose(); }, [sphere, ring]);
  return <>
    {connections.map(edge => <NeuralConnection key={edge.id} points={edge.points} runtime={runtimes.get(edge.to)} emphasized={state.selectedId === graph.rootId || edge.from === state.selectedId || edge.to === state.selectedId} hovered={edge.from === hoveredId || edge.to === hoveredId} moving={moving} />)}
    <NeuralParticles connections={connections} runtimes={runtimes} selectedId={state.selectedId} moving={moving} compact={compact} />
    {visibleIds.map(id => <NeuralNode key={id} node={graph.nodes[id]} runtime={runtimes.get(id)} isReady={readyIds.has(id)} focusable={id === state.selectedId || graph.nodes[state.selectedId].children.includes(id)} dimmed={state.selectedId !== graph.rootId && id !== state.selectedId && !graph.nodes[state.selectedId].children.includes(id) && id !== hoveredId} visualState={getNodeState(graph, state, id, hoveredId)} onSelect={onSelect} onHover={onHover} moving={moving} reduced={reduced} sphere={sphere} ring={ring} />)}
  </>;
}

function OutputTether({ node, outputRef, tetherRef, compact }) {
  const { camera, size } = useThree();
  const point = useMemo(() => new Vector3(), []), anchor = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const panel = outputRef.current, tether = tetherRef.current;
    if (!panel) return;
    const measure = () => { const rect = panel.getBoundingClientRect(); anchor.current = { x: compact ? rect.left + rect.width / 2 : rect.left, y: compact ? rect.top : rect.top + 70 }; };
    measure(); const observer = new ResizeObserver(measure); observer.observe(panel);
    window.addEventListener("resize", measure);
    return () => { observer.disconnect(); window.removeEventListener("resize", measure); if (tether) tether.style.opacity = "0"; };
  }, [node, compact, outputRef, tetherRef]);
  useFrame(() => {
    const line = tetherRef.current;
    if (!line) return;
    point.fromArray(node.position).project(camera);
    const x = (point.x * .5 + .5) * size.width, y = (-point.y * .5 + .5) * size.height;
    const dx = anchor.current.x - x, dy = anchor.current.y - y;
    line.style.opacity = point.z < 1 && point.z > -1 && x > 0 && x < size.width && y > 50 && y < size.height ? "1" : "0";
    line.style.width = `${Math.hypot(dx, dy)}px`;
    line.style.transform = `translate3d(${x}px,${y}px,0) rotate(${Math.atan2(dy, dx)}rad)`;
  });
  return null;
}

function SceneLifecycle({ onReady, onFailure, onSlow, moving }) {
  const { gl } = useThree();
  const frames = useRef({ count: 0, time: 0, checked: false });
  useEffect(() => {
    onReady(); const element = gl.domElement;
    const lost = event => { event.preventDefault(); onFailure(); };
    element.addEventListener("webglcontextlost", lost);
    return () => element.removeEventListener("webglcontextlost", lost);
  }, [gl, onReady, onFailure]);
  useFrame((_, delta) => {
    if (!moving || frames.current.checked) return;
    frames.current.count++; frames.current.time += delta;
    if (frames.current.time > 5) { frames.current.checked = true; if (frames.current.count / frames.current.time < 38) onSlow(); }
  });
  return null;
}

export default function NeuralScene(props) {
  const { graph, state, compact, reduced, moving, lowQuality, outputRef, tetherRef } = props;
  return <Canvas camera={{ position: [0, 1, 23], fov: 44, near: .1, far: 220 }} dpr={compact || lowQuality ? 1 : [1, 1.5]} frameloop={moving ? "always" : "demand"} gl={{ alpha: false, antialias: !compact, powerPreference: "low-power" }} fallback={null} onCreated={({ gl }) => gl.setClearColor("#080c0e")}>
    <color attach="background" args={["#080c0e"]} /><fog attach="fog" args={["#080c0e", 40, 110]} />
    <ambientLight intensity={.5} /><pointLight position={[5, 4, 5]} intensity={3} color="#a4d7c8" />
    <CameraRig graph={graph} selectedId={state.selectedId} compact={compact} reduced={reduced} moving={moving} />
    <AmbientParticles moving={moving} compact={compact || lowQuality} />
    <GraphWorld key={state.resetKey} {...props} />
    <OutputTether node={graph.nodes[state.selectedId]} outputRef={outputRef} tetherRef={tetherRef} compact={compact} />
    <SceneLifecycle {...props} />
  </Canvas>;
}
