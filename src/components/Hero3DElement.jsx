"use client";

import { useRef, useMemo, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Float, PerformanceMonitor, Preload } from "@react-three/drei";
import * as THREE from "three";

function ParticleSphere() {
  const pointsRef = useRef(null);
  
  // Create particles
  const [positions, colors] = useMemo(() => {
    const count = 1000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    const color1 = new THREE.Color("#0ea5e9"); // sky-500
    const color2 = new THREE.Color("#2dd4bf"); // teal-400
    
    for (let i = 0; i < count; i++) {
      // Spherical distribution
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const radius = 2 + (Math.random() * 0.5 - 0.25);
      
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);
      
      positions.set([x, y, z], i * 3);
      
      // Mix colors
      const mixedColor = color1.clone().lerp(color2, Math.random());
      colors.set([mixedColor.r, mixedColor.g, mixedColor.b], i * 3);
    }
    
    return [positions, colors];
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.1;
      pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={positions.length / 3}
            array={positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={colors.length / 3}
            array={colors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.05}
          vertexColors
          transparent
          opacity={0.8}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>
      
      {/* Central Core */}
      <mesh>
        <icosahedronGeometry args={[1.2, 1]} />
        <meshStandardMaterial 
          color="#0ea5e9" 
          wireframe 
          transparent 
          opacity={0.3} 
          emissive="#0ea5e9"
          emissiveIntensity={0.5}
        />
      </mesh>
    </Float>
  );
}

export default function Hero3DElement() {
  const [dpr, setDpr] = useState(1.5);
  
  return (
    <div className="w-full h-full absolute inset-0 cursor-grab active:cursor-grabbing">
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }} dpr={dpr} performance={{ min: 0.5 }}>
        <Suspense fallback={null}>
          <PerformanceMonitor onIncline={() => setDpr(2)} onDecline={() => setDpr(1)} />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} color="#0ea5e9" />
          <ParticleSphere />
          <OrbitControls 
            enableZoom={false} 
            enablePan={false}
            autoRotate 
            autoRotateSpeed={0.5}
          />
          <Preload all />
        </Suspense>
      </Canvas>
    </div>
  );
}
