"use client";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Object3D } from "three";

export default function NeuralParticles({ connections, runtimes, selectedId, moving, compact, palette }) {
  const mesh = useRef(), elapsed = useRef(0);
  const object = useMemo(() => new Object3D(), []);
  const perEdge = compact ? 1 : 2, count = connections.length * perEdge;
  useFrame((_, delta) => {
    if (moving) elapsed.current += Math.min(delta, .05);
    connections.forEach((edge, index) => {
      const runtime = runtimes.get(edge.to), points = edge.points, last = points.length / 3 - 1;
      for (let particle = 0; particle < perEdge; particle++) {
        const progress = (elapsed.current * .18 + index * .137 + particle * .5) % 1;
        const step = progress * last, base = Math.floor(step), blend = step - base;
        const a = base * 3, b = Math.min(base + 1, last) * 3;
        object.position.set(points[a] + (points[b] - points[a]) * blend, points[a + 1] + (points[b + 1] - points[a + 1]) * blend, points[a + 2] + (points[b + 2] - points[a + 2]) * blend);
        const active = edge.from === selectedId || edge.to === selectedId;
        object.scale.setScalar(progress < runtime.growth && runtime.growth > .05 ? (active ? .036 : .019) : 0);
        object.updateMatrix(); mesh.current.setMatrixAt(index * perEdge + particle, object.matrix);
      }
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });
  if (!count) return null;
  return <instancedMesh ref={mesh} args={[null, null, count]} raycast={() => null} frustumCulled={false}><sphereGeometry args={[1, 5, 4]} /><meshBasicMaterial color={palette.signal} toneMapped={false} /></instancedMesh>;
}
