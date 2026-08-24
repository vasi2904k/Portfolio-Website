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
    <nav className="sticky top-3 z-40 mb-6 border border-[#26313e] bg-[#080b10]/95 p-2 md:top-4">
      <ul className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          <li key={item.id} className="nav-item" style={{ animationDelay: `${40 + index * 55}ms` }}>
            <a
              href={`#${item.id}`}
              aria-current={activeId === item.id ? "page" : undefined}
              className={`inline-flex px-3 py-2 text-xs font-medium tracking-[0.08em] transition md:text-sm ${
                activeId === item.id
                  ? "bg-[#b8f35c] text-[#080b10]"
                  : "text-slate-400 hover:text-[#b8f35c]"
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
