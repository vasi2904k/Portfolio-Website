"use client";
import { memo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
function NeuralConnection({ points, runtime, emphasized, hovered, moving, palette }) {
  const geometry = useRef(), material = useRef(), signal = useRef(), signalMat = useRef();
  const signalPos = useRef(new Float32Array(6));
  const signalPhase = useRef(Math.random());
  useFrame(({ clock }, delta) => {
    const totalPoints = points.length / 3;
    geometry.current.setDrawRange(0, runtime.growth <= 0 ? 0 : Math.max(2, Math.floor(runtime.growth * totalPoints)));
    const hover = moving && hovered ? Math.sin(clock.elapsedTime * 3) * .1 : 0;
    const targetOpacity = (hovered ? .7 : emphasized ? .55 : .075) + hover;
    const rate = moving ? 1 - Math.exp(-Math.min(delta, .05) * 8) : 1;
    material.current.opacity += (targetOpacity - material.current.opacity) * rate;

    // Traveling signal on active-path connections: a bright dot moves along the bezier
    if (signal.current && signalMat.current) {
      const active = emphasized && !hovered && moving && runtime.growth >= 1;
      signalMat.current.opacity += ((active ? .8 : 0) - signalMat.current.opacity) * rate;
      if (active) {
        signalPhase.current = (signalPhase.current + delta * 0.22) % 1;
        const t = signalPhase.current;
        const idx = Math.min(Math.floor(t * (totalPoints - 1)), totalPoints - 2) * 3;
        const nextIdx = idx + 3;
        const lt = (t * (totalPoints - 1)) - Math.floor(t * (totalPoints - 1));
        // Interpolate between two consecutive bezier points
        signalPos.current[0] = points[idx] + (points[nextIdx] - points[idx]) * lt;
        signalPos.current[1] = points[idx + 1] + (points[nextIdx + 1] - points[idx + 1]) * lt;
        signalPos.current[2] = points[idx + 2] + (points[nextIdx + 2] - points[idx + 2]) * lt;
        // Trail point slightly behind
        const trailT = Math.max(0, t - 0.04);
        const trailIdx = Math.min(Math.floor(trailT * (totalPoints - 1)), totalPoints - 2) * 3;
        const nextTrail = trailIdx + 3;
        const tlt = (trailT * (totalPoints - 1)) - Math.floor(trailT * (totalPoints - 1));
        signalPos.current[3] = points[trailIdx] + (points[nextTrail] - points[trailIdx]) * tlt;
        signalPos.current[4] = points[trailIdx + 1] + (points[nextTrail + 1] - points[trailIdx + 1]) * tlt;
        signalPos.current[5] = points[trailIdx + 2] + (points[nextTrail + 2] - points[trailIdx + 2]) * tlt;
        signal.current.geometry.attributes.position.needsUpdate = true;
      }
    }
  });
  return <>
    <line raycast={() => null}>
      <bufferGeometry ref={geometry}><bufferAttribute attach="attributes-position" count={points.length / 3} array={points} itemSize={3} /></bufferGeometry>
      <lineBasicMaterial ref={material} color={hovered ? palette.selected : emphasized ? palette.edge : palette.fiber} transparent opacity={0} depthWrite={false} />
    </line>
    <line ref={signal} raycast={() => null} frustumCulled={false}>
      <bufferGeometry><bufferAttribute attach="attributes-position" count={2} array={signalPos.current} itemSize={3} /></bufferGeometry>
      <lineBasicMaterial ref={signalMat} color={palette.signal} transparent opacity={0} depthWrite={false} linewidth={2} />
    </line>
  </>;
}
export default memo(NeuralConnection);
