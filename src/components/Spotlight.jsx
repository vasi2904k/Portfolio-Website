"use client";

import { useEffect, useState } from "react";
import { motion, useSpring } from "framer-motion";

export default function Spotlight() {
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Use springs for smooth following
  const springConfig = { damping: 30, stiffness: 200, mass: 1 };
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
      cursorX.set(event.clientX);
      cursorY.set(event.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handlePointerLeave = () => setIsVisible(false);
    const handlePointerEnter = () => setIsVisible(true);
    const handleResize = () => moveToCenter();

    moveToCenter();

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("resize", handleResize);
    document.addEventListener("pointerleave", handlePointerLeave);
    document.addEventListener("pointerenter", handlePointerEnter);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("pointerleave", handlePointerLeave);
      document.removeEventListener("pointerenter", handlePointerEnter);
    };
  }, [cursorX, cursorY, isVisible]);

  if (!isMounted) return null;

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-50 transition-opacity duration-300"
      style={{ opacity: isVisible ? 1 : 0 }}
    >
      <motion.div
        className="absolute h-96 w-96 rounded-full bg-sky-400/10 blur-[100px]"
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
