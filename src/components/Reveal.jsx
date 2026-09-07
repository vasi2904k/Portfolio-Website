"use client";
import { useEffect, useRef } from "react";
export default function Reveal({ children, className = "", delay = 0 }) {
  const ref = useRef(null);
  useEffect(() => {
    const node = ref.current;
    if (!node || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Content is visible without JavaScript; only offscreen elements opt into reveal.
    if (node.getBoundingClientRect().top < window.innerHeight) return;
    node.classList.add("reveal-pending");
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { node.classList.remove("reveal-pending"); observer.unobserve(node); } }, { threshold: .06 });
    observer.observe(node);
    return () => { observer.disconnect(); node.classList.remove("reveal-pending"); };
  }, []);
  return <div ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
}
