"use client";
import { memo, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { AdditiveBlending, Color } from "three";
const colors = { selected: new Color("#d7ffeb"), hover: new Color("#c3eada"), active: new Color("#a0c5b4"), expanded: new Color("#84a99c"), inactive: new Color("#647e75") };

function NeuralNode({ node, runtime, isReady, focusable, dimmed, visualState, onSelect, onHover, moving, reduced, sphere, ring }) {
  const shape = useRef(), core = useRef(), aura = useRef(), orbit = useRef(), label = useRef();
  const isRoot = node.depth === 0;
  const targetColor = useMemo(() => new Color(), []);
  const interactive = () => isReady && runtime.spawn > .98;
  useFrame(({ clock }, delta) => {
    const rate = reduced || !moving ? 1 : 1 - Math.exp(-Math.min(delta, .05) * 9);
    const highlighted = visualState === "selected" || visualState === "hover";
    const size = (isRoot ? .29 : .17) * (highlighted ? 1.2 : 1);
    const pulse = moving && highlighted ? 1 + Math.sin(clock.elapsedTime * 1.1) * .035 : 1;
    shape.current.scale.setScalar(runtime.spawn);
    core.current.scale.lerp({ x: size * pulse, y: size * pulse, z: size * pulse }, rate);
    targetColor.copy(colors[visualState] || colors.inactive).multiplyScalar(dimmed ? .4 : 1);
    core.current.material.color.lerp(targetColor, rate);
    aura.current.scale.setScalar(size * (highlighted ? 3.1 : 2.4));
    aura.current.material.opacity += ((highlighted ? .09 : .025) - aura.current.material.opacity) * rate;
    orbit.current.scale.setScalar(isRoot ? .62 : .43);
    orbit.current.material.opacity += ((visualState === "selected" ? .45 : visualState === "hover" ? .24 : .05) - orbit.current.material.opacity) * rate;
    if (moving) orbit.current.rotation.z += delta * .07;
    if (label.current) {
      label.current.style.opacity = String(runtime.spawn * (dimmed ? .3 : visualState === "inactive" ? .43 : 1));
      label.current.style.visibility = runtime.spawn > .5 ? "visible" : "hidden";
    }
  });
  return <group position={node.position}>
    <group ref={shape} scale={0}>
      <mesh ref={core} geometry={sphere} scale={.17}><meshBasicMaterial color="#a0c5b4" toneMapped={false} /></mesh>
      <mesh ref={aura} geometry={sphere} raycast={() => null}><meshBasicMaterial color="#a8e4c9" transparent opacity={.05} depthWrite={false} blending={AdditiveBlending} /></mesh>
      <mesh ref={orbit} geometry={ring} rotation={[.25, -.35, 0]} raycast={() => null}><meshBasicMaterial color="#b2d8c4" transparent opacity={.1} depthWrite={false} /></mesh>
      <mesh geometry={sphere} scale={isRoot ? .75 : .56} onPointerOver={(event) => { if (!interactive()) return; event.stopPropagation(); onHover(node.id); }} onPointerOut={() => onHover(null)} onClick={(event) => { if (!interactive() || event.delta > 7) return; event.stopPropagation(); onSelect(node.id); }}><meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} /></mesh>
    </group>
    <Html center position={[0, isRoot ? -.68 : -.53, 0]} zIndexRange={[24, 5]}>
      <button ref={label} type="button" data-neural-id={node.id} className={`neuron-label ${isRoot ? "root-label" : ""} neuron-${visualState}`} disabled={!isReady} tabIndex={isReady && focusable ? 0 : -1} style={{ opacity: isReady ? (dimmed ? .3 : 1) : 0, visibility: isReady ? "visible" : "hidden" }} aria-pressed={visualState === "selected"} aria-label={`${node.label}${node.children.length ? `, explore ${node.children.length} connections` : ", reveal content"}`} onPointerEnter={() => { if (interactive()) onHover(node.id); }} onPointerLeave={() => onHover(null)} onFocus={() => onHover(node.id)} onBlur={() => onHover(null)} onClick={(event) => { event.stopPropagation(); if (interactive()) onSelect(node.id); }}>
        <span>{node.label}</span><small>{isRoot ? "THE ORIGIN" : node.children.length ? `${node.children.length} CONNECTIONS` : "EXPLORE ↗"}</small>
      </button>
    </Html>
  </group>;
}
export default memo(NeuralNode);
