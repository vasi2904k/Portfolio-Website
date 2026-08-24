"use client";
import { useEffect, useRef, useState } from "react";
export default function Reveal({ children, className = "", delay = 0 }) {
  const ref = useRef(null); const [visible, setVisible] = useState(false);
  useEffect(() => { const node = ref.current; if (!node || window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setVisible(true); return; } const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.unobserve(entry.target); } }, { threshold: 0.12, rootMargin: "0px 0px -6%" }); observer.observe(node); return () => observer.disconnect(); }, []);
  return <div ref={ref} className={`reveal ${visible ? "is-visible" : ""} ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
}
