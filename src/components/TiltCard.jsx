"use client";

import { useRef, useEffect, useCallback } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

export default function TiltCard({ children, className = "" }) {
  const ref = useRef(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const isHoverable = useRef(true);

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia) {
      isHoverable.current = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    }
  }, []);

  const lastTimeRef = useRef(0);

  const handleMouseMove = useCallback((e) => {
    if (!ref.current || !isHoverable.current) return;
    
    const now = Date.now();
    if (now - lastTimeRef.current < 16) return; // Throttle to 60fps
    lastTimeRef.current = now;
    
    const rect = ref.current.getBoundingClientRect();
    
    const width = rect.width;
    const height = rect.height;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    
    x.set(xPct);
    y.set(yPct);
  }, [x, y]);

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateY,
        rotateX,
        transformStyle: "preserve-3d",
      }}
      className={`relative w-full h-full transition-transform duration-200 ease-linear will-change-transform ${className}`}
    >
      {children}
    </motion.div>
  );
}
