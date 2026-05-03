"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useSpring } from "framer-motion";

export default function Spotlight() {
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const throttleRef = useRef(null);

  // Use springs for smooth following - optimized for performance
  const springConfig = { damping: 50, stiffness: 100, mass: 2 };
  const cursorX = useSpring(0, springConfig);
  const cursorY = useSpring(0, springConfig);

  useEffect(() => {
    setIsMounted(true);

    const moveToCenter = () => {
      cursorX.set(window.innerWidth / 2);
      cursorY.set(window.innerHeight / 2);
      setIsVisible(true);
    };

    const handlePointerMove = (event) => {
      // Throttle pointer events
      if (throttleRef.current) clearTimeout(throttleRef.current);
      throttleRef.current = setTimeout(() => {
        cursorX.set(event.clientX);
        cursorY.set(event.clientY);
        if (!isVisible) setIsVisible(true);
      }, 16); // ~60fps throttle
    };

    const handlePointerLeave = () => setIsVisible(false);
    const handlePointerEnter = () => setIsVisible(true);
    const handleResize = () => moveToCenter();

    moveToCenter();

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });
    document.addEventListener("pointerleave", handlePointerLeave);
    document.addEventListener("pointerenter", handlePointerEnter);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("pointerleave", handlePointerLeave);
      document.removeEventListener("pointerenter", handlePointerEnter);
      if (throttleRef.current) clearTimeout(throttleRef.current);
    };
  }, [cursorX, cursorY, isVisible]);

  if (!isMounted) return null;

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-50 transition-opacity duration-300"
      style={{ opacity: isVisible ? 0.7 : 0 }}
    >
      <motion.div
        className="absolute h-80 w-80 rounded-full bg-sky-400/8 blur-[80px] will-change-transform sm:h-60 sm:w-60"
        style={{
          left: 0,
          top: 0,
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
        }}
      />
    </motion.div>
  );
}
