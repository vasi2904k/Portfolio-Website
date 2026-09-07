"use client";
import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { gsap } from "gsap";
import { Vector3 } from "three";
import { calculateCameraFrame } from "@/utils/cameraFrame.mjs";

export default function useCameraAnimation({ graph, selectedId, compact, reduced, moving }) {
  const { camera, size, pointer, invalidate } = useThree();
  const pose = useRef({ x: 0, y: 0, z: 0, distance: 23 });
  const look = useMemo(() => new Vector3(), []);
  const drift = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const target = calculateCameraFrame(graph, selectedId, size.width, size.height, compact);
    const tween = gsap.to(pose.current, { ...target, duration: reduced ? 0 : 1.35, ease: "power3.inOut", overwrite: true, onUpdate: invalidate });
    invalidate();
    return () => tween.kill();
  }, [graph, selectedId, size.width, size.height, compact, reduced, invalidate]);
  useFrame((_, delta) => {
    const p = pose.current, blend = 1 - Math.exp(-Math.min(delta, .05) * 4);
    const px = moving && !compact ? pointer.x * .26 : 0;
    const py = moving && !compact ? pointer.y * .17 : 0;
    drift.current.x += (px - drift.current.x) * blend; drift.current.y += (py - drift.current.y) * blend;
    camera.position.set(p.x + drift.current.x, p.y + .3 + drift.current.y, p.z + p.distance);
    look.set(p.x, p.y, p.z); camera.lookAt(look);
  });
}
