"use client";
import { memo, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { AdditiveBlending, Color, Vector3 } from "three";

function NeuralNode({ node, runtime, isReady, locked, focusable, dimmed, visualState, onSelect, onNodePress, onHover, onFocus, moving, reduced, compact, palette, sphere, ring }) {
  const colors = useMemo(() => Object.fromEntries(["selected", "hover", "available", "expanded", "inactive"].map(key => [key, new Color(palette[key])])), [palette]);
  const shape = useRef(), core = useRef(), aura = useRef(), orbit = useRef(), label = useRef(), labelAnchor = useRef(), leader = useRef();
  const leaderPoints = useMemo(() => new Float32Array(6), []);
  useLayoutEffect(() => { runtime.labelAnchor = labelAnchor.current; return () => { runtime.labelAnchor = null; }; }, [runtime]);
  const isRoot = node.depth === 0;
  const targetColor = useMemo(() => new Color(), []);
  const targetScale = useMemo(() => new Vector3(), []);
  const interactive = () => isReady && !locked && focusable && runtime.spawn > .98;
  useFrame(({ clock }, delta) => {
    const rate = reduced || !moving ? 1 : 1 - Math.exp(-Math.min(delta, .05) * 9);
    const highlighted = visualState === "selected" || visualState === "hover";
    const size = (isRoot ? .29 : .17) * (highlighted ? 1.2 : 1) * (compact ? 2 : 1);
    const pulse = moving && highlighted ? 1 + Math.sin(clock.elapsedTime * 1.1) * .035 : 1;
    shape.current.scale.setScalar(runtime.spawn);
    targetScale.setScalar(size * pulse); core.current.scale.lerp(targetScale, rate);
    targetColor.copy(colors[visualState] || colors.inactive).multiplyScalar(dimmed ? .55 : 1);
    core.current.material.color.lerp(targetColor, rate);
    aura.current.scale.setScalar(size * (highlighted ? 3.1 : 2.4));
    aura.current.material.opacity += ((highlighted ? .09 : .025) - aura.current.material.opacity) * rate;
    orbit.current.scale.setScalar((isRoot ? .62 : .43) * (compact ? 1.4 : 1));
    orbit.current.material.opacity += ((visualState === "selected" ? .45 : visualState === "hover" ? .24 : .05) - orbit.current.material.opacity) * rate;
    if (moving) orbit.current.rotation.z += delta * .07;
    if (label.current) {
      label.current.style.opacity = String(runtime.spawn * (dimmed ? .4 : visualState === "inactive" ? .6 : 1));
      label.current.style.visibility = runtime.spawn > .5 && runtime.labelVisible ? "visible" : "hidden";
      label.current.style.width = runtime.labelWidth + "px";
    }
    labelAnchor.current.position.copy(runtime.labelPosition);
    leaderPoints[3] = runtime.labelPosition.x; leaderPoints[4] = runtime.labelPosition.y; leaderPoints[5] = runtime.labelPosition.z;
    leader.current.geometry.attributes.position.needsUpdate = true;
    leader.current.visible = runtime.labelVisible && runtime.spawn > .5;
  });
  return <group position={node.position}>
    <group ref={shape} scale={0}>
      <mesh ref={core} geometry={sphere} scale={.17}><meshBasicMaterial color={palette.available} toneMapped={false} /></mesh>
      <mesh ref={aura} geometry={sphere} raycast={() => null}><meshBasicMaterial color={palette.aura} transparent opacity={.05} depthWrite={false} blending={AdditiveBlending} /></mesh>
      <mesh ref={orbit} geometry={ring} rotation={[.25, -.35, 0]} raycast={() => null}><meshBasicMaterial color={palette.selected} transparent opacity={.1} depthWrite={false} /></mesh>
      <mesh geometry={sphere} scale={isRoot ? .75 : compact ? .72 : .56} onPointerDown={event => { if (interactive()) { event.stopPropagation(); onNodePress(node.id, event.pointerId); } }} onPointerOver={(event) => { if (!interactive() || event.pointerType === "touch") return; event.stopPropagation(); onHover(node.id); }} onPointerOut={() => onHover(null)}><meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} /></mesh>
    </group>
    <line ref={leader} frustumCulled={false} raycast={() => null}><bufferGeometry><bufferAttribute attach="attributes-position" count={2} array={leaderPoints} itemSize={3} /></bufferGeometry><lineBasicMaterial color={palette.edge} transparent opacity={.18} depthWrite={false} /></line>
    <group ref={labelAnchor}><Html center zIndexRange={[24, 5]}>
      <button ref={label} type="button" data-neural-id={node.id} className={`neuron-label ${isRoot ? "root-label" : ""} neuron-${visualState}`} disabled={!isReady || locked || !focusable} tabIndex={isReady && focusable && !locked ? 0 : -1} style={{ opacity: isReady ? (dimmed ? .4 : 1) : 0, visibility: isReady ? "visible" : "hidden" }} aria-pressed={visualState === "selected"} aria-label={`${node.label}${node.children.length ? `, explore ${node.children.length} connections` : ", reveal content"}`} onPointerEnter={event => { if (interactive() && event.pointerType !== "touch") onHover(node.id); }} onPointerLeave={() => onHover(null)} onFocus={() => onFocus(node.id)} onBlur={() => onFocus(null)} onClick={(event) => { event.stopPropagation(); if (interactive()) onSelect(node.id, event.detail === 0); }}>
        <span title={node.label}>{node.label}</span><small>{visualState === "selected" ? "YOU ARE HERE" : node.children.length ? `${node.children.length} CONNECTIONS` : "EXPLORE ↗"}</small>
      </button>
    </Html></group>
  </group>;
}
export default memo(NeuralNode);
