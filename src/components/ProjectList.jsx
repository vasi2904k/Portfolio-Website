"use client";
import { useMemo, useState } from "react";
import Reveal from "@/components/Reveal";
import TiltCard from "@/components/TiltCard";
import ProjectShare from "@/components/ProjectShare";
import { classifyProject } from "@/utils/projectClassifier.mjs";

const normal = (value) => (value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
const categoryFor = (name) => /analysis|eda|ecommerce|pollution|imdb/i.test(name) ? "Data analysis" : /portfolio|website|readme|vasi2904k/i.test(name) ? "Web & tools" : "Machine learning";
const displayName = (repo) => repo.title || classifyProject(repo).displayName;
const descriptionFor = (repo) => normal(repo.name) === "ecommercesales" ? "Exploring e-commerce sales data through cleaning, feature engineering, and visualization to uncover useful patterns." : repo.description || "An engineering experiment exploring practical tools, reproducible workflows, and new ideas.";
const categories = ["All projects", "Machine learning", "Data analysis", "Web & tools"];
export default function ProjectList({ repos }) {
  const [category, setCategory] = useState("All projects"), [query, setQuery] = useState(""), [all, setAll] = useState(false);
  const sorted = useMemo(() => [...repos].sort((a, b) => {
    const ai = a.priority ?? classifyProject(a).priority;
    const bi = b.priority ?? classifyProject(b).priority;
    return ai - bi || new Date(b.updated_at) - new Date(a.updated_at);
  }), [repos]);
  const filtered = sorted.filter((repo) => (category === "All projects" || categoryFor(repo.name) === category) && `${repo.name} ${repo.description || ""} ${repo.language || ""}`.toLowerCase().includes(query.toLowerCase().trim()));
  const visible = all ? filtered : filtered.slice(0, 6);
  return <><div className="project-toolbar"><div className="project-filters" aria-label="Filter projects by category">{categories.map((item) => <button key={item} type="button" aria-pressed={category === item} onClick={() => { setCategory(item); setAll(false); }}>{item}{item === "All projects" && <span>{repos.length.toString().padStart(2, "0")}</span>}</button>)}</div><label className="project-search"><span className="sr-only">Search projects</span><input type="search" placeholder="Search projects…" value={query} onChange={(event) => { setQuery(event.target.value); setAll(false); }} /><span aria-hidden="true">⌕</span></label></div>
    <p className="sr-only" role="status">{filtered.length} matching projects</p>
    <div className="project-grid">{visible.map((repo, index) => <Reveal key={repo.projectId || repo.id} delay={(index % 3) * 70}><TiltCard max={3}><article className="project-card"><div className="project-card-top"><span className="project-number mono">EXPERIMENT / {String(sorted.indexOf(repo) + 1).padStart(2, "0")}</span><a className="project-open" href={repo.github || repo.html_url} target="_blank" rel="noreferrer" aria-label={`Open ${displayName(repo)} on GitHub`}>↗</a></div><div className="project-body"><p className="project-category mono"><span className="status-dot" />{categoryFor(repo.name)}</p><h3><a href={repo.github || repo.html_url} target="_blank" rel="noreferrer">{displayName(repo)}</a></h3><p className="project-description">{descriptionFor(repo)}</p><div className="project-tags"><span>{repo.language || "Engineering"}</span>{repo.topics?.slice(0, 2).map((topic) => <span key={topic}>{topic}</span>)}</div><div className="project-footer"><a href={repo.github || repo.html_url} target="_blank" rel="noreferrer" className="text-link">View project <span aria-hidden="true">↗</span></a><ProjectShare repo={repo} /></div></div></article></TiltCard></Reveal>)}</div>
    {filtered.length === 0 && <div className="project-empty"><p>No projects match this search.</p><button type="button" className="text-link" onClick={() => { setQuery(""); setCategory("All projects"); }}>Clear filters ↗</button></div>}
    {filtered.length > 6 && <div className="project-more"><button type="button" className="button button-secondary" onClick={(event) => { setAll(!all); if (all) { document.getElementById("projects")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" }); event.currentTarget.blur(); } }}>{all ? "Show selected projects" : `Explore all ${filtered.length} projects`} <span aria-hidden="true">{all ? "−" : "+"}</span></button></div>}
  </>;
}
