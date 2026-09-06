"use client";
import { useEffect, useRef } from "react";
export default function TiltCard({ children, className = "", max = 5 }) {
  const ref = useRef(null); const frame = useRef(null); const active = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia("(hover: hover) and (pointer: fine)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(([entry]) => { active.current = entry.isIntersecting; }, { threshold: .1 }); observer.observe(el);
    const move = (event) => { if (!active.current) return; const b = el.getBoundingClientRect(); const x = ((event.clientX - b.left) / b.width - .5) * 2; const y = ((event.clientY - b.top) / b.height - .5) * 2; if (frame.current) cancelAnimationFrame(frame.current); frame.current = requestAnimationFrame(() => { el.style.setProperty("--tilt-x", `${-y * max}deg`); el.style.setProperty("--tilt-y", `${x * max}deg`); el.dataset.tilted = "true"; }); };
    const leave = () => { el.style.setProperty("--tilt-x", "0deg"); el.style.setProperty("--tilt-y", "0deg"); delete el.dataset.tilted; };
    el.addEventListener("pointermove", move, { passive: true }); el.addEventListener("pointerleave", leave);
    return () => { observer.disconnect(); el.removeEventListener("pointermove", move); el.removeEventListener("pointerleave", leave); if (frame.current) cancelAnimationFrame(frame.current); };
  }, [max]);
  return <div ref={ref} className={`tilt-card ${className}`}>{children}</div>;
}
