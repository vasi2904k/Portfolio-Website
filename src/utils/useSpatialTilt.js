"use client";

import { useEffect, useRef } from "react";

export default function useSpatialTilt() {
  const ref = useRef(null);
  const frame = useRef(null);
  const active = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || !window.matchMedia("(hover: hover) and (pointer: fine)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(([entry]) => { active.current = entry.isIntersecting; }, { threshold: 0.15 });
    observer.observe(node);
    const move = (event) => {
      if (!active.current) return;
      const rect = node.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      if (frame.current) cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => {
        node.style.setProperty("--tilt-x", `${(-y * 5).toFixed(2)}deg`);
        node.style.setProperty("--tilt-y", `${(x * 6).toFixed(2)}deg`);
      });
    };
    const leave = () => { if (frame.current) cancelAnimationFrame(frame.current); node.style.setProperty("--tilt-x", "0deg"); node.style.setProperty("--tilt-y", "0deg"); };
    node.addEventListener("pointermove", move, { passive: true }); node.addEventListener("pointerleave", leave, { passive: true });
    return () => { observer.disconnect(); node.removeEventListener("pointermove", move); node.removeEventListener("pointerleave", leave); if (frame.current) cancelAnimationFrame(frame.current); };
  }, []);
  return ref;
}
