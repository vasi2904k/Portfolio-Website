"use client";
import { useState } from "react";
import Reveal from "@/components/Reveal";
import SectionTitle from "@/components/SectionTitle";
const groups = [
  { name: "Data foundation", label: "INPUT", symbol: "{ }", tools: ["Python", "Pandas", "NumPy", "SQL"], title: "Good models start with good data.", description: "Exploring datasets, finding patterns, and transforming raw information into reliable features.", process: ["Explore", "Clean", "Transform", "Validate"] },
  { name: "Machine learning", label: "HIDDEN", symbol: "ƒ(x)", tools: ["Scikit-learn", "XGBoost", "Feature engineering", "Model training"], title: "From patterns to predictions.", description: "Building, evaluating, and refining models through careful experimentation and meaningful validation.", process: ["Engineer", "Train", "Evaluate", "Iterate"] },
  { name: "AI systems", label: "OUTPUT", symbol: "↗", tools: ["PyTorch", "LLMs", "APIs", "Automation"], title: "Intelligence that leaves the notebook.", description: "Exploring deep learning and language models, connecting APIs, and turning experiments into useful applications.", process: ["Connect", "Integrate", "Deploy", "Improve"] },
];
export default function Skills() {
  const [active, setActive] = useState(1);
  const group = groups[active];
  const activate = (event, index) => {
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % 3;
    else if (event.key === "ArrowLeft") next = (index + 2) % 3;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = 2;
    else return;
    event.preventDefault(); setActive(next); document.getElementById(`stack-tab-${next}`)?.focus();
  };
  return <section id="skills" className="content-section"><SectionTitle eyebrow="03 / MY NEURAL STACK" title={<>Different tools.<br /><span className="muted-heading">One connected system.</span></>} description="The technologies I use and explore, from the first data point to the final prediction." /><Reveal><div className="stack-console"><div className="console-top mono"><span><span className="status-dot" /> TOOLKIT / EXPLORER</span><span>SELECT A LAYER ↓</span></div><div className="stack-tabs" role="tablist" aria-label="Technology layers">{groups.map((item, index) => <button id={`stack-tab-${index}`} key={item.name} role="tab" type="button" aria-selected={active === index} aria-controls={`stack-panel-${index}`} tabIndex={active === index ? 0 : -1} onKeyDown={(event) => activate(event, index)} onClick={() => setActive(index)}><span className="stack-tab-number mono">0{index + 1} / {item.label}</span><strong>{item.name}</strong><span className="stack-tab-dot" /></button>)}</div><div className="stack-panel" id={`stack-panel-${active}`} role="tabpanel" aria-labelledby={`stack-tab-${active}`} tabIndex={0}><div className={`stack-sculpture stack-mode-${active}`} aria-hidden="true"><div className="stack-orbit orbit-one" /><div className="stack-orbit orbit-two" /><div className="stack-orbit orbit-three" /><div className="stack-core"><span>{group.symbol}</span></div>{group.tools.map((tool, index) => <span className={`orbit-tool orbit-tool-${index}`} key={tool}>{tool}</span>)}</div><div className="stack-detail" key={group.name}><span className="eyebrow">LAYER 0{active + 1} / {group.label}</span><h3>{group.title}</h3><p>{group.description}</p><div className="stack-tools">{group.tools.map((tool) => <span key={tool}>{tool}</span>)}</div><div className="stack-process mono">{group.process.map((step, index) => <span key={step}>{index > 0 && <i aria-hidden="true">→</i>}{step}</span>)}</div></div></div><div className="console-bottom mono"><span>ALWAYS LEARNING. ALWAYS ITERATING.</span><span>DATA → MODELS → IMPACT</span></div></div></Reveal></section>;
}
