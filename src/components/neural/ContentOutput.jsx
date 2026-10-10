"use client";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import NeuralIcon from "./NeuralIcon";

export default function ContentOutput({ graph, node, outputRef, readyIds, reduced, visited, onReset, onBack, canGoBack, isAnimating, phaseLabel, resetKey, compact, panelExpanded, onToggleStory }) {
  const body = useRef(), scroll = useRef(), timer = useRef();
  const [copy, setCopy] = useState("Copy address");
  useEffect(() => {
    setCopy("Copy address"); clearTimeout(timer.current);
    scroll.current?.scrollTo({ top: 0 });
    const tween = gsap.fromTo(body.current, { opacity: reduced ? 1 : 0, y: reduced ? 0 : 12 }, { opacity: 1, y: 0, duration: reduced ? 0 : .55, delay: reduced ? 0 : .22, ease: "power2.out", clearProps: "transform" });
    return () => { tween.kill(); clearTimeout(timer.current); };
  }, [node.id, reduced, resetKey]);
  const copyAddress = async () => {
    try { await navigator.clipboard.writeText(node.copy); setCopy("Address copied"); }
    catch { setCopy("Select the address to copy"); }
    clearTimeout(timer.current); timer.current = setTimeout(() => setCopy("Copy address"), 3000);
  };
  return <aside ref={outputRef} className={`content-output output-${node.kind} ${compact && !panelExpanded ? "output-collapsed" : ""}`} data-network-ui aria-busy={isAnimating} aria-label={`Content for ${node.label}`}>
    <div className="output-port" aria-hidden="true" />
    <div className="output-top"><span><i /> {phaseLabel || (node.kind === "root" ? "Introduction" : node.label)}</span>{compact && node.children.length > 0 ? <button type="button" className="story-toggle" disabled={isAnimating} onClick={onToggleStory} aria-expanded={panelExpanded} aria-controls="node-story" aria-label={panelExpanded ? "Close details" : node.kind === "root" ? "Read introduction" : "Read details"}>{panelExpanded ? "Close" : node.kind === "root" ? "Read introduction" : "Read details"}</button> : <span>{String(node.depth).padStart(2, "0")} / {node.kind === "root" ? "Home" : "Level"}</span>}</div>
    <div id="node-story" ref={scroll} className="output-scroll" tabIndex={0} aria-label="Scroll node content" hidden={compact && !panelExpanded}>
      <div ref={body} className="output-body"><p className="output-eyebrow">{node.eyebrow || `${node.kind.toUpperCase()} / ${node.label.toUpperCase()}`}</p>
        <h1 id="output-title">{node.title.split("\n").map((line, index) => <span key={`${line}-${index}`} className={node.kind === "root" && index === 2 ? "output-emphasis" : ""}>{line}</span>)}</h1>
        <p className="output-summary">{node.summary}</p>
        {node.detail && <p className="output-detail">{node.detail}</p>}
        {node.kind === "project" && (node.problem || node.solution || node.architecture) && <div className="project-evidence">
          {node.problem && <section><h2>Problem</h2><p>{node.problem}</p></section>}
          {node.solution && <section><h2>Solution</h2><p>{node.solution}</p></section>}
          {node.architecture && <section><h2>Architecture</h2><p>{node.architecture}</p></section>}
        </div>}
        {node.bullets && <ul className="output-bullets">{node.bullets.map(item => <li key={item}>{item}</li>)}</ul>}
        {node.highlights?.length > 0 && <section className="project-list"><h2>Highlights</h2><ul>{node.highlights.map(item => <li key={item}>{item}</li>)}</ul></section>}
        {node.metrics?.length > 0 && <section className="project-list project-results"><h2>Results from README</h2><ul>{node.metrics.map(item => <li key={item}>{item}</li>)}</ul></section>}
        {node.technologies?.length > 0 && <section className="project-stack"><h2>Technologies</h2><p>{node.technologies.join(" · ")}</p></section>}
        {node.tags?.length > 0 && <div className="output-tags">{node.tags.map(tag => <span key={tag}>{tag}</span>)}</div>}
        {node.actions?.length > 0 && <div className="output-actions">{node.actions.map((action, index) => <a className={index === 0 ? "output-action primary-action" : "output-action"} key={action.href} href={action.href} {...(/^https?:/.test(action.href) ? { target: "_blank", rel: "noreferrer" } : {})}>{action.label}<NeuralIcon name="arrow" /></a>)}</div>}
        {node.copy && <button type="button" className="copy-address" onClick={copyAddress} aria-live="polite">{copy} <NeuralIcon name="brief" /></button>}
        {node.children.length > 0 && <div className="output-connections"><div className="output-connections-title"><span>Connected sections</span><span>{String(node.children.filter(id => readyIds.has(id)).length).padStart(2, "0")} / {String(node.children.length).padStart(2, "0")}</span></div><div className="branch-status-dots" aria-hidden="true">{node.children.map(id => <i key={id} className={`${readyIds.has(id) ? "path-ready" : ""} ${visited.includes(id) ? "path-visited" : ""}`} title={graph.nodes[id].label} />)}</div><p className="branch-status-copy">{node.children.every(id => readyIds.has(id)) ? "Choose a section to see what's connected" : "Loading the connected sections…"}</p></div>}
        {!node.children.length && <p className="output-leaf-note">Path complete. Go Back to choose another connection.</p>}
      </div>
    </div>
    {(!compact || panelExpanded) && <div className="output-bottom"><span>{node.children.length ? "See a section" : "End of this section"}</span><button type="button" disabled={isAnimating} onClick={canGoBack ? onBack : onReset}>{canGoBack ? "← Previous location" : "⌂ Return to root"}</button></div>}
  </aside>;
}
