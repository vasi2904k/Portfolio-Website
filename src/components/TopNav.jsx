"use client";

import { useEffect, useState } from "react";

const items = [
  { id: "about", label: "About" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "experience", label: "Experience" },
  { id: "linkedin", label: "Journey" },
  { id: "contact", label: "Contact" }
];

export default function TopNav() {
  const [activeId, setActiveId] = useState("projects");

  useEffect(() => {
    const sections = items
      .map((item) => document.getElementById(item.id))
      .filter(Boolean);

    if (sections.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]?.target?.id) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        threshold: [0.25, 0.5, 0.75],
        rootMargin: "-25% 0px -55% 0px"
      }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <nav className="sticky top-3 z-40 mb-6 rounded-2xl border border-white/15 bg-slate-950/45 p-2 shadow-glass backdrop-blur-xl md:top-4">
      <ul className="flex flex-wrap gap-2">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={`inline-flex rounded-full px-4 py-2 text-xs font-medium tracking-[0.08em] transition md:text-sm ${
                activeId === item.id
                  ? "bg-sky-300/20 text-sky-100 ring-1 ring-sky-200/40"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
