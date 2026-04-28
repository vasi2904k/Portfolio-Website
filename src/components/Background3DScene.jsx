"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Line, PerformanceMonitor, Preload } from "@react-three/drei";
import * as THREE from "three";

function NeuralOrbit() {
  const coreRef = useRef(null);
  const ringRef = useRef(null);
  const swarmRef = useRef(null);

  const [nodePositions, nodeConnections] = useMemo(() => {
    const nodeCount = 18;
    const positions = new Float32Array(nodeCount * 3);
    const connections = [];

    for (let index = 0; index < nodeCount; index += 1) {
      const angle = (index / nodeCount) * Math.PI * 2;
      const radius = 2.4 + Math.sin(index * 1.7) * 0.35;
      const height = Math.cos(index * 1.3) * 0.9;

      positions.set(
        [
          Math.cos(angle) * radius,
          height,
          Math.sin(angle) * radius,
        ],
        index * 3,
      );
    }

    for (let index = 0; index < nodeCount; index += 1) {
      connections.push([index, (index + 1) % nodeCount]);
      connections.push([index, (index + 5) % nodeCount]);
    }

    return [positions, connections];
  }, []);

  const connectionPoints = useMemo(
    () =>
      nodeConnections.map(([startIndex, endIndex]) => {
        const start = startIndex * 3;
        const end = endIndex * 3;

        return [
          new THREE.Vector3(
            nodePositions[start],
            nodePositions[start + 1],
            nodePositions[start + 2],
          ),
          new THREE.Vector3(
            nodePositions[end],
            nodePositions[end + 1],
            nodePositions[end + 2],
          ),
        ];
      }),
    [nodeConnections, nodePositions],
  );

  useFrame((state) => {
    const elapsed = state.clock.elapsedTime;

    if (coreRef.current) {
      coreRef.current.rotation.y = elapsed * 0.12;
      coreRef.current.rotation.x = Math.sin(elapsed * 0.15) * 0.08;
    }

    if (ringRef.current) {
      ringRef.current.rotation.z = elapsed * 0.18;
    }

    if (swarmRef.current) {
      swarmRef.current.rotation.y = elapsed * 0.05;
    }
  });

  return (
    <Float speed={0.8} rotationIntensity={0.35} floatIntensity={0.7}>
      <group ref={swarmRef} position={[0, 0.2, 0]}>
        <mesh ref={coreRef}>
          <icosahedronGeometry args={[1.15, 1]} />
          <meshStandardMaterial
            color="#0ea5e9"
            wireframe
            transparent
            opacity={0.16}
            emissive="#0ea5e9"
            emissiveIntensity={0.55}
          />
        </mesh>

        <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.15, 0.035, 16, 120]} />
          <meshStandardMaterial
            color="#2dd4bf"
            transparent
            opacity={0.28}
            emissive="#2dd4bf"
            emissiveIntensity={0.4}
          />
        </mesh>

        <points>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={nodePositions.length / 3}
              array={nodePositions}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.09}
            color="#7dd3fc"
            transparent
            opacity={0.8}
            sizeAttenuation
            blending={THREE.AdditiveBlending}
          />
        </points>

        {connectionPoints.map(([start, end], index) => (
          <Line
            key={`${index}-${start.x}-${end.x}`}
            points={[start, end]}
            color={index % 3 === 0 ? "#38bdf8" : "#2dd4bf"}
            lineWidth={1}
            transparent
            opacity={0.14}
          />
        ))}

        {nodeConnections.slice(0, 6).map(([startIndex], index) => {
          const offset = startIndex * 3;
          const x = nodePositions[offset];
          const y = nodePositions[offset + 1];
          const z = nodePositions[offset + 2];

          return (
            <mesh key={`node-${index}`} position={[x, y, z]}>
              <sphereGeometry args={[0.08, 14, 14]} />
              <meshStandardMaterial
                color={index % 2 === 0 ? "#38bdf8" : "#2dd4bf"}
                emissive={index % 2 === 0 ? "#38bdf8" : "#2dd4bf"}
                emissiveIntensity={1}
                transparent
                opacity={0.75}
              />
            </mesh>
          );
        })}
      </group>
    </Float>
  );
}

export default function Background3DScene() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 opacity-65">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(14,165,233,0.08),transparent_42%),radial-gradient(circle_at_70%_70%,rgba(45,212,191,0.05),transparent_34%)]" />
      <Canvas camera={{ position: [0, 0, 7.5], fov: 38 }} dpr={[1, 1.5]} performance={{ min: 0.5 }}>
        <Suspense fallback={null}>
          <PerformanceMonitor />
          <ambientLight intensity={0.45} />
          <directionalLight position={[6, 8, 10]} intensity={1.1} color="#7dd3fc" />
          <pointLight position={[-6, -3, 4]} intensity={0.65} color="#2dd4bf" />
          <pointLight position={[4, 2, -6]} intensity={0.3} color="#f97316" />
          <NeuralOrbit />
          <Preload all />
        </Suspense>
      </Canvas>
    </div>
  );
}