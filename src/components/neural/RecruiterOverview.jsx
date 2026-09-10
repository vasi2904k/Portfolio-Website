"use client";
import { EMAIL, GITHUB_USERNAME, LINKEDIN_URL } from "@/config/config";

export default function RecruiterOverview({ graph, onNavigate, onClose }) {
  const projects = graph.order.map(id => graph.nodes[id]).filter(node => node.kind === "project")
    .sort((a, b) => Number(!a.featured) - Number(!b.featured) || a.priority - b.priority).slice(0, 6);
  const experience = graph.order.map(id => graph.nodes[id]).filter(node => node.kind === "experience");
  const skills = [...new Set(graph.order.map(id => graph.nodes[id]).filter(node => node.kind === "skill").map(node => node.label))].slice(0, 16);
  const navigate = id => { onClose(false); onNavigate(id); };
  return <section id="recruiter-overview" className="recruiter-overview" data-network-ui role="dialog" aria-label="Recruiter overview">
    <div className="help-top"><span>60-SECOND RECRUITER VIEW</span><button type="button" autoFocus onClick={() => onClose()} aria-label="Close recruiter overview">×</button></div>
    <div className="recruiter-heading"><p>MACHINE LEARNING ENGINEER</p><h2>Mohammed Vasi Khan</h2><span>Practical AI, data workflows, and user-centered engineering.</span></div>
    <div className="recruiter-actions" aria-label="Recruiter shortcuts">
      <button type="button" onClick={() => navigate("projects")}>Explore projects</button>
      <button type="button" onClick={() => navigate("journey")}>View experience</button>
      <a href={`mailto:${EMAIL}`}>Contact</a>
      <button type="button" onClick={() => window.print()}>Resume / save PDF</button>
    </div>
    <div className="recruiter-scroll">
      <section><div className="recruiter-section-title"><h3>Selected work</h3><button type="button" onClick={() => navigate("projects")}>Open in network ↗</button></div>
        <div className="recruiter-projects">{projects.map(project => <article key={project.id}><p>{project.projectCategory || "PROJECT"}{project.featured ? " / FEATURED" : ""}</p><h4>{project.title}</h4><span>{project.summary}</span><a href={project.actions?.[0]?.href} target="_blank" rel="noreferrer">GitHub ↗</a></article>)}</div>
      </section>
      <section><div className="recruiter-section-title"><h3>Experience</h3><button type="button" onClick={() => navigate("journey")}>Open in network ↗</button></div>
        <div className="recruiter-timeline">{experience.map(item => <article key={item.id}><p>{item.eyebrow}</p><h4>{item.title}</h4><span>{item.summary}</span></article>)}</div>
      </section>
      <section><div className="recruiter-section-title"><h3>Technical toolkit</h3><button type="button" onClick={() => navigate("skills")}>Open in network ↗</button></div>
        <div className="recruiter-skills">{skills.map(skill => <span key={skill}>{skill}</span>)}</div>
      </section>
    </div>
    <footer><a href={`https://github.com/${GITHUB_USERNAME}`} target="_blank" rel="noreferrer">GitHub ↗</a><a href={LINKEDIN_URL} target="_blank" rel="noreferrer">LinkedIn ↗</a><a href={`mailto:${EMAIL}`}>{EMAIL}</a></footer>
  </section>;
}
