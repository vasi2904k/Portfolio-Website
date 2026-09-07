"use client";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { AdditiveBlending, Color, Object3D } from "three";
import { createNetwork } from "@/utils/neuralNetwork";

function Neurons({ nodes, layer, onSelectLayer }) {
  const ref = useRef(), halo = useRef();
  useLayoutEffect(() => {
    const object = new Object3D(), color = new Color();
    nodes.forEach((node, index) => {
      const selected = layer === 0 || node.layer === layer;
      object.position.fromArray(node.position); object.scale.setScalar(node.size * (selected ? 1 : .65)); object.updateMatrix();
      ref.current.setMatrixAt(index, object.matrix);
      ref.current.setColorAt(index, color.set(node.color).multiplyScalar(selected ? 1.2 : .22));
      object.scale.multiplyScalar(2.1); object.updateMatrix(); halo.current.setMatrixAt(index, object.matrix);
      halo.current.setColorAt(index, color.set(node.color).multiplyScalar(selected ? .8 : .12));
    });
    [ref, halo].forEach((mesh) => { mesh.current.instanceMatrix.needsUpdate = true; mesh.current.instanceColor.needsUpdate = true; mesh.current.computeBoundingSphere(); });
  }, [nodes, layer]);
  return <>
    <instancedMesh ref={ref} args={[null, null, nodes.length]} onClick={(event) => { if (event.delta > 6 || event.instanceId === undefined) return; event.stopPropagation(); onSelectLayer(nodes[event.instanceId].layer); }}><icosahedronGeometry args={[1, 1]} /><meshBasicMaterial toneMapped={false} /></instancedMesh>
    <instancedMesh ref={halo} args={[null, null, nodes.length]} raycast={() => null}><icosahedronGeometry args={[1, 0]} /><meshBasicMaterial transparent opacity={.12} blending={AdditiveBlending} depthWrite={false} /></instancedMesh>
  </>;
}

function Connections({ nodes, edges, layer }) {
  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(edges.length * 6), colors = new Float32Array(edges.length * 6);
    const color = new Color();
    edges.forEach(([from, to], index) => {
      positions.set(nodes[from].position, index * 6); positions.set(nodes[to].position, index * 6 + 3);
      const selected = layer === 0 || nodes[from].layer === layer || nodes[to].layer === layer;
      color.set(selected ? "#45998d" : "#133333"); colors.set([color.r, color.g, color.b, color.r, color.g, color.b], index * 6);
    });
    return { positions, colors };
  }, [nodes, edges, layer]);
  return <lineSegments raycast={() => null}><bufferGeometry><bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} /><bufferAttribute attach="attributes-color" count={colors.length / 3} array={colors} itemSize={3} /></bufferGeometry><lineBasicMaterial vertexColors transparent opacity={.45} depthWrite={false} /></lineSegments>;
}

function Signals({ nodes, edges, moving, compact, layer }) {
  const ref = useRef(), elapsed = useRef(0);
  const object = useMemo(() => new Object3D(), []);
  const count = compact ? 22 : 42;
  useFrame((_, delta) => {
    if (moving) elapsed.current += Math.min(delta, .05);
    for (let i = 0; i < count; i++) {
      const edge = edges[(i * 13) % edges.length], from = nodes[edge[0]], to = nodes[edge[1]];
      const progress = (elapsed.current * .24 + i / count) % 1;
      object.position.set(...from.position.map((value, axis) => value + (to.position[axis] - value) * progress));
      object.scale.setScalar(layer === 0 || from.layer === layer || to.layer === layer ? .032 : 0);
      object.updateMatrix(); ref.current.setMatrixAt(i, object.matrix);
    }
    ref.current.instanceMatrix.needsUpdate = true;
  });
  return <instancedMesh ref={ref} args={[null, null, count]} frustumCulled={false} raycast={() => null}><sphereGeometry args={[1, 5, 4]} /><meshBasicMaterial color="#caffed" toneMapped={false} /></instancedMesh>;
}

function CityGrid() {
  const buildings = useMemo(() => Array.from({ length: 24 }, (_, index) => ({ x: (index % 8 - 3.5) * 1.25, z: Math.floor(index / 8) * 1.2 - 1, h: .2 + ((index * 17) % 9) * .09 })), []);
  const ref = useRef();
  useLayoutEffect(() => {
    const object = new Object3D();
    buildings.forEach((b, i) => { object.position.set(b.x, -3.45 + b.h / 2, b.z); object.scale.set(.42, b.h, .42); object.updateMatrix(); ref.current.setMatrixAt(i, object.matrix); });
    ref.current.instanceMatrix.needsUpdate = true; ref.current.computeBoundingSphere();
  }, [buildings]);
  return <group><gridHelper position={[0, -3.45, 0]} args={[14, 28, "#19544c", "#12302e"]} /><instancedMesh ref={ref} args={[null, null, buildings.length]} raycast={() => null}><boxGeometry /><meshBasicMaterial color="#266159" wireframe transparent opacity={.35} /></instancedMesh></group>;
}

function Scene({ moving, compact, reduced, layer, rotation, eventRoot, onReady, onSlow, onSelectLayer }) {
  const group = useRef(), elapsed = useRef(0), samples = useRef({ time: 0, frames: 0, checked: false });
  const { invalidate, camera } = useThree();
  const { nodes, edges } = useMemo(() => createNetwork(), []);
  useEffect(() => {
    camera.lookAt(0, -.3, 0); onReady();
    const element = eventRoot.current, update = () => invalidate();
    element?.addEventListener("neural-rotate", update);
    return () => element?.removeEventListener("neural-rotate", update);
  }, [camera, eventRoot, invalidate, onReady]);
  useFrame((_, delta) => {
    const step = Math.min(delta, .05);
    if (moving) {
      elapsed.current += step;
      if (!samples.current.checked) {
        samples.current.frames++; samples.current.time += delta;
        if (samples.current.time > 4) { samples.current.checked = true; if (samples.current.frames / samples.current.time < 38) onSlow(); }
      }
    }
    const angle = rotation.current + Math.sin(elapsed.current * .12) * .18;
    group.current.rotation.y += (angle - group.current.rotation.y) * (reduced ? 1 : Math.min(1, step * 6));
    group.current.position.y = Math.sin(elapsed.current * .4) * .06;
    if (!moving && Math.abs(angle - group.current.rotation.y) > .001) invalidate();
  });
  return <group ref={group} rotation={[0, -.2, -.06]}><Neurons nodes={nodes} layer={layer} onSelectLayer={onSelectLayer} /><Connections nodes={nodes} edges={edges} layer={layer} /><Signals nodes={nodes} edges={edges} layer={layer} moving={moving} compact={compact} /><CityGrid />
    <mesh rotation={[.1, .2, 0]} raycast={() => null}><torusGeometry args={[4.6, .006, 3, 100]} /><meshBasicMaterial color="#376454" transparent opacity={.55} /></mesh>
    <mesh rotation={[.45, .5, .25]} raycast={() => null}><torusGeometry args={[4.8, .004, 3, 100]} /><meshBasicMaterial color="#245747" transparent opacity={.3} /></mesh>
  </group>;
}

export default function NeuralCanvas(props) {
  const [low, setLow] = useState(false);
  return <Canvas camera={{ position: [0, 2, 15.5], fov: 43, near: .1, far: 60 }} dpr={props.compact || low ? 1 : [1, 1.5]} frameloop={props.moving ? "always" : "demand"} gl={{ antialias: !props.compact, alpha: true, powerPreference: "low-power" }} onCreated={({ gl }) => gl.setClearColor("#060f13", 0)} fallback={null}><ContextEvents onFailure={props.onFailure} /><Scene {...props} onSlow={() => setLow(true)} /></Canvas>;
}

function ContextEvents({ onFailure }) {
  const { gl } = useThree();
  useEffect(() => { const canvas = gl.domElement; const lost = (event) => { event.preventDefault(); onFailure(); }; canvas.addEventListener("webglcontextlost", lost); return () => canvas.removeEventListener("webglcontextlost", lost); }, [gl, onFailure]);
  return null;
}
