"use client";
import { useEffect, useState } from "react";
const links = [["about", "About"], ["projects", "Projects"], ["skills", "Stack"], ["experience", "Journey"]];
export default function TopNav() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("home");
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) setActive(entry.target.id); });
    }, { rootMargin: "-15% 0px -60% 0px" });
    document.querySelectorAll("main section[id]").forEach((node) => observer.observe(node));
    const escape = (event) => { if (event.key === "Escape") { setOpen(false); document.getElementById("menu-toggle")?.focus(); } };
    document.addEventListener("keydown", escape);
    return () => { observer.disconnect(); document.removeEventListener("keydown", escape); };
  }, []);
  return (
    <header className="site-header"><div className="nav-inner">
      <a href="#home" className="brand" aria-label="Vasi Khan, home" onClick={() => setOpen(false)}><span className="brand-symbol" aria-hidden="true">V<span>.</span></span><span>VASI KHAN<span className="brand-subtitle mono">ENGINEER / CREATOR</span></span></a>
      <nav id="primary-navigation" className={`primary-nav ${open ? "is-open" : ""}`} aria-label="Main navigation">
        {links.map(([id, label], index) => <a key={id} href={`#${id}`} aria-current={active === id ? "location" : undefined} onClick={() => setOpen(false)}><span className="mono">0{index + 1}</span> {label}</a>)}
        <a href="#contact" className="nav-contact" onClick={() => setOpen(false)}>Let’s talk <span aria-hidden="true">↗</span></a>
      </nav>
      <div className="nav-status mono"><span className="status-dot" /> OPEN TO CONNECT</div>
      <button id="menu-toggle" type="button" className="menu-toggle" aria-expanded={open} aria-controls="primary-navigation" aria-label={open ? "Close navigation" : "Open navigation"} onClick={() => setOpen(!open)}><span /> <span /></button>
    </div></header>
  );
}
