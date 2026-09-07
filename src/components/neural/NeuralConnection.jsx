"use client";
import { memo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
function NeuralConnection({ points, runtime, emphasized, hovered, moving }) {
  const geometry = useRef(), material = useRef();
  useFrame(({ clock }, delta) => {
    geometry.current.setDrawRange(0, runtime.growth <= 0 ? 0 : Math.max(2, Math.floor(runtime.growth * (points.length / 3))));
    const pulse = moving && hovered ? Math.sin(clock.elapsedTime * 3) * .1 : 0;
    const opacity = (hovered ? .65 : emphasized ? .42 : .075) + pulse;
    material.current.opacity += (opacity - material.current.opacity) * (moving ? 1 - Math.exp(-Math.min(delta, .05) * 8) : 1);
  });
  return <line raycast={() => null}><bufferGeometry ref={geometry}><bufferAttribute attach="attributes-position" count={points.length / 3} array={points} itemSize={3} /></bufferGeometry><lineBasicMaterial ref={material} color={hovered ? "#b2dfca" : "#7dafa0"} transparent opacity={0} depthWrite={false} /></line>;
}
export default memo(NeuralConnection);
