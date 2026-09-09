"use client";
import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { SphereGeometry, TorusGeometry, Vector3 } from "three";
import { gsap } from "gsap";
import useCameraAnimation from "@/hooks/useCameraAnimation";
import { getNodeState } from "@/utils/graphModel.mjs";
import { connectionPoints } from "@/utils/neuralCurves";
import { getGraphViewport } from "@/utils/cameraFrame.mjs";
import { arrangeNodeLabels, getLabelWidth } from "@/utils/nodeLabels.mjs";
import NeuralNode from "./NeuralNode";
import NeuralConnection from "./NeuralConnection";
import NeuralParticles from "./NeuralParticles";
import NeuralEnvironment from "./NeuralEnvironment";
import { NEURAL_QUALITY } from "@/config/neuralPalette.mjs";

function CameraRig(props) { useCameraAnimation(props); return null; }
function GraphWorld({ graph, state, visibleIds, readyIds, hoveredId, onHover, onFocus, onSelect, onNodePress, onReveal, moving, reduced, compact, panelExpanded, palette }) {
  const { invalidate, size } = useThree();
  const runtimes = useMemo(() => new Map(), []);
  const sphere = useMemo(() => new SphereGeometry(1, 18, 14), []);
  const ring = useMemo(() => new TorusGeometry(1, .008, 3, 64), []);
  visibleIds.forEach(id => { if (!runtimes.has(id)) runtimes.set(id, { growth: id === graph.rootId ? 1 : 0, spawn: id === graph.rootId ? 1 : 0, labelPosition: new Vector3(0, -.53, 0), labelVisible: false, labelWidth: 106 }); });
  const labelRect = useMemo(() => getGraphViewport(size.width, size.height, compact, panelExpanded), [size.width, size.height, compact, panelExpanded]);
  const reading = compact && panelExpanded && graph.nodes[state.currentNode].children.length > 0;
  const labels = useMemo(() => visibleIds.filter(id => id === state.currentNode || (!reading && graph.nodes[state.currentNode].children.includes(id))).map(id => ({ id, anchor: new Vector3(...graph.nodes[id].position), projected: new Vector3(), desiredX: 0, desiredY: 0, x: 0, y: 0 })), [graph, state.currentNode, visibleIds, reading]);
  const labelWidth = getLabelWidth(labelRect, labels.length);
  useFrame(({ camera }) => {
    for (const runtime of runtimes.values()) runtime.labelVisible = false;
    for (const item of labels) {
      item.projected.copy(item.anchor); item.projected.y -= .6; item.projected.project(camera);
      item.desiredX = (item.projected.x + 1) * size.width / 2;
      item.desiredY = (1 - item.projected.y) * size.height / 2;
    }
    arrangeNodeLabels(labels, labelRect, labelWidth);
    for (const item of labels) {
      const runtime = runtimes.get(item.id);
      item.projected.x = item.x / size.width * 2 - 1; item.projected.y = 1 - item.y / size.height * 2;
      runtime.labelPosition.copy(item.projected.unproject(camera)).sub(item.anchor);
      runtime.labelVisible = true; runtime.labelWidth = labelWidth;
      if (runtime.labelAnchor) { runtime.labelAnchor.position.copy(runtime.labelPosition); runtime.labelAnchor.updateMatrixWorld(); }
    }
  }, -1);
  const connections = useMemo(() => graph.edges.filter(edge => visibleIds.includes(edge.to)).map(edge => ({ ...edge, points: connectionPoints(graph.nodes[edge.from].position, graph.nodes[edge.to].position) })), [graph, visibleIds]);
  useEffect(() => {
    // Remove collapsed runtimes so reopening a branch grows it again.
    for (const id of runtimes.keys()) if (!visibleIds.includes(id)) runtimes.delete(id);
    if (state.phase !== "EXPAND_BRANCH") return;
    const timelines = [];
    visibleIds.forEach(id => {
      const runtime = runtimes.get(id);
      if (runtime.spawn >= 1) { onReveal(id, state.revision); return; }
      const node = graph.nodes[id], siblings = graph.nodes[node.parentId]?.children || [];
      const delay = reduced ? 0 : siblings.indexOf(id) * .30;
      if (reduced) { runtime.growth = 1; runtime.spawn = 1; onReveal(id, state.revision); invalidate(); return; }
      const timeline = gsap.timeline({ delay, onUpdate: invalidate, onComplete: () => onReveal(id, state.revision) });
      timeline.to(runtime, { growth: 1, duration: .20 * (1 - runtime.growth), ease: "power2.inOut" }).to(runtime, { spawn: 1, duration: .12, ease: "back.out(1.3)" });
      timelines.push(timeline);
    });
    invalidate();
    return () => timelines.forEach(timeline => timeline.kill());
  }, [graph, visibleIds, reduced, runtimes, invalidate, onReveal, state.revision, state.phase]);
  useEffect(() => () => { sphere.dispose(); ring.dispose(); }, [sphere, ring]);
  return <>
    {connections.map(edge => <NeuralConnection key={edge.id} points={edge.points} runtime={runtimes.get(edge.to)} emphasized={state.currentNode === graph.rootId || edge.from === state.currentNode || state.activePath.includes(edge.to)} hovered={edge.from === hoveredId || edge.to === hoveredId} moving={moving} palette={palette} />)}
    <NeuralParticles connections={connections} runtimes={runtimes} selectedId={state.currentNode} moving={moving || (state.phase === "EXPAND_BRANCH" && !reduced)} compact={compact} palette={palette} />
    {visibleIds.map(id => <NeuralNode key={id} node={graph.nodes[id]} runtime={runtimes.get(id)} isReady={readyIds.has(id)} locked={state.isAnimating} focusable={id === state.currentNode || (!reading && graph.nodes[state.currentNode].children.includes(id))} dimmed={state.currentNode !== graph.rootId && !state.activePath.includes(id) && !graph.nodes[state.currentNode].children.includes(id) && id !== hoveredId} visualState={getNodeState(graph, state, id, hoveredId, readyIds.has(id))} onSelect={onSelect} onNodePress={onNodePress} onHover={onHover} onFocus={onFocus} moving={moving} reduced={reduced} compact={compact} palette={palette} sphere={sphere} ring={ring} />)}
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

function SceneLifecycle({ onReady, onFailure, onSlow, moving, qualityName }) {
  const { gl } = useThree();
  const frames = useRef({ count: 0, time: 0, checked: false });
  const metrics = useRef(0);
  useEffect(() => { gl.domElement.dataset.environmentQuality = qualityName; }, [gl, qualityName]);
  useEffect(() => {
    onReady(); const element = gl.domElement;
    const lost = event => { event.preventDefault(); onFailure(); };
    element.addEventListener("webglcontextlost", lost);
    return () => element.removeEventListener("webglcontextlost", lost);
  }, [gl, onReady, onFailure]);
  useFrame((_, delta) => {
    metrics.current += delta;
    if (metrics.current > 2) {
      metrics.current = 0;
      gl.domElement.dataset.drawCalls = String(gl.info.render.calls);
      gl.domElement.dataset.geometries = String(gl.info.memory.geometries);
    }
    if (!moving || frames.current.checked) return;
    frames.current.count++; frames.current.time += delta;
    if (frames.current.time > 5) { frames.current.checked = true; if (frames.current.count / frames.current.time < 38) onSlow(); }
  });
  return null;
}

export default function NeuralScene(props) {
  const { graph, state, compact, reduced, moving, qualityName, palette, outputRef, tetherRef } = props;
  const quality = NEURAL_QUALITY[qualityName];
  return <Canvas camera={{ position: [0, 1, 23], fov: 44, near: .1, far: 500 }} dpr={[1, quality.dpr]} frameloop={moving ? "always" : "demand"} gl={{ alpha: false, antialias: !compact, powerPreference: "low-power" }} fallback={null}>
    <color attach="background" args={[palette.background]} /><fog attach="fog" args={[palette.background, 80, 235]} />
    <ambientLight intensity={.5} /><pointLight position={[5, 4, 5]} intensity={3} color={palette.aura} />
    <CameraRig {...props} />
    <NeuralEnvironment key={qualityName} quality={quality} palette={palette} activePosition={graph.nodes[state.currentNode].position} revision={state.revision} moving={moving} reduced={reduced} />
    <GraphWorld {...props} />
    <OutputTether node={graph.nodes[state.currentNode]} outputRef={outputRef} tetherRef={tetherRef} compact={compact} />
    <SceneLifecycle {...props} />
  </Canvas>;
}
