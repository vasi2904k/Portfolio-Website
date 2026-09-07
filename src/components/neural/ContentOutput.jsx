"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";

export default function ContentOutput({ graph, node, outputRef, readyIds, reduced, visited, onReset, resetKey }) {
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
  return <aside ref={outputRef} className={`content-output output-${node.kind}`} data-network-ui aria-label={`Content for ${node.label}`}>
    <div className="output-port" aria-hidden="true" />
    <div className="output-top"><span><i /> {node.kind === "root" ? "THE ORIGIN" : "CONNECTED OUTPUT"}</span><span>{String(node.depth).padStart(2, "0")} / {node.kind === "root" ? "ROOT" : "DEPTH"}</span></div>
    <div ref={scroll} className="output-scroll" tabIndex={0} aria-label="Scroll node content">
      <div ref={body} className="output-body"><p className="output-eyebrow">{node.eyebrow || `${node.kind.toUpperCase()} / ${node.label.toUpperCase()}`}</p>
        <h1 id="output-title">{node.title.split("\n").map((line, index) => <span key={`${line}-${index}`} className={node.kind === "root" && index === 2 ? "output-emphasis" : ""}>{line}</span>)}</h1>
        {node.image && <div className={`output-image ${node.imageType === "portrait" ? "output-portrait" : ""}`}><Image src={node.image} alt={node.imageType === "portrait" ? "Mohammed Vasi Khan" : `${node.title} project preview`} fill sizes="(max-width: 760px) 90vw, 350px" className="object-cover" /></div>}
        <p className="output-summary">{node.summary}</p>
        {node.detail && <p className="output-detail">{node.detail}</p>}
        {node.bullets && <ul className="output-bullets">{node.bullets.map(item => <li key={item}>{item}</li>)}</ul>}
        {node.tags?.length > 0 && <div className="output-tags">{node.tags.map(tag => <span key={tag}>{tag}</span>)}</div>}
        {node.actions?.length > 0 && <div className="output-actions">{node.actions.map((action, index) => <a className={index === 0 ? "output-action primary-action" : "output-action"} key={action.href} href={action.href} {...(/^https?:/.test(action.href) ? { target: "_blank", rel: "noreferrer" } : {})}>{action.label}<span aria-hidden="true">↗</span></a>)}</div>}
        {node.copy && <button type="button" className="copy-address" onClick={copyAddress} aria-live="polite">{copy} <span aria-hidden="true">⧉</span></button>}
        {node.children.length > 0 && <div className="output-connections"><div className="output-connections-title"><span>PATHWAYS CONNECTED</span><span>{String(node.children.filter(id => readyIds.has(id)).length).padStart(2, "0")} / {String(node.children.length).padStart(2, "0")}</span></div><div className="branch-status-dots" aria-hidden="true">{node.children.map(id => <i key={id} className={`${readyIds.has(id) ? "path-ready" : ""} ${visited.includes(id) ? "path-visited" : ""}`} title={graph.nodes[id].label} />)}</div><p className="branch-status-copy">{node.children.every(id => readyIds.has(id)) ? "Choose a connected neuron to continue exploring." : "New pathways are forming. Follow their connections."}</p></div>}
        {!node.children.length && <p className="output-leaf-note">One pathway explored. Scroll to discover the next.</p>}
        {node.kind === "root" && <p className="root-note">BUILT WITH CURIOSITY. EXPLORED BY YOU.</p>}
      </div>
    </div>
    <div className="output-bottom"><span>{node.children.length ? "BRANCH / EXPANDABLE" : "LEAF / EXPLORED"}</span><button type="button" onClick={onReset}>Return to origin <span aria-hidden="true">↖</span></button></div>
  </aside>;
}
