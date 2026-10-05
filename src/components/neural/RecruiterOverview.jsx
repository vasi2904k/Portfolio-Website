"use client";
import { EMAIL, GITHUB_USERNAME, LINKEDIN_URL, PROFILE } from "@/config/config";
import NeuralIcon, { NeuralMark } from "./NeuralIcon";

export default function RecruiterOverview({ graph, onNavigate, onClose }) {
  const projects = graph.order.map(id => graph.nodes[id]).filter(node => node.kind === "project")
    .sort((a, b) => Number(!a.featured) - Number(!b.featured) || a.priority - b.priority).slice(0, 6);
  const experience = graph.order.map(id => graph.nodes[id]).filter(node => node.kind === "experience");
  const groups = graph.nodes.skills.children.map(id => graph.nodes[id]);
  const navigate = id => { onClose(false); onNavigate(id); };
  return <section id="recruiter-overview" className="recruiter-overview human-portfolio" data-network-ui role="dialog" aria-label="Recruiter overview">
    <div className="portfolio-bar"><span><NeuralMark /> VASI KHAN / PORTFOLIO</span><button type="button" autoFocus onClick={() => onClose()} aria-label="Close recruiter overview"><NeuralIcon name="close" /></button></div>
    <div className="portfolio-layout">
      <aside className="portfolio-identity">
        <h2>{PROFILE.name}</h2><p className="portfolio-role">{PROFILE.title}</p>
        <p className="portfolio-bio">I connect data, ideas, and the problems people need solved. My work combines machine learning experiments with practical experience in operations and autonomous delivery support.</p>
        <nav aria-label="Portfolio sections"><a href="#portfolio-about">About</a><a href="#portfolio-work">Projects</a><a href="#portfolio-skills">Skills</a><a href="#portfolio-experience">Experience</a></nav>
        <div className="portfolio-links"><a href={`https://github.com/${GITHUB_USERNAME}`} target="_blank" rel="noreferrer">GitHub<NeuralIcon name="arrow" /></a><a href={LINKEDIN_URL} target="_blank" rel="noreferrer">LinkedIn<NeuralIcon name="arrow" /></a><a href={`mailto:${EMAIL}`}>Email<NeuralIcon name="mail" /></a></div>
        <a className="portfolio-resume" href="/mohammed-vasi-khan-resume.pdf" download>Download resume<NeuralIcon name="down" /></a>
        <button className="portfolio-lab" type="button" onClick={() => onClose()}>Return to neural network<NeuralIcon name="map" /></button>
      </aside>
      <div className="portfolio-stream">
        <section id="portfolio-about"><h3>Curiosity, put to work.</h3><p>I approach machine learning as an iterative engineering process: understand the problem, explore the data, establish a useful baseline, and evaluate honestly.</p><p>Here are the projects, tools, and experiences behind the network.</p></section>
        <section id="portfolio-work"><div className="portfolio-section-head"><h3>Selected work</h3><button type="button" onClick={() => navigate("projects")}>Explore projects<NeuralIcon name="arrow" /></button></div>
          <div className="portfolio-projects">{projects.map(project => <article key={project.id}><div className="portfolio-project-meta">{project.projectCategory || "Project"}{project.featured && <span>Selected</span>}</div><h4>{project.title}</h4><p>{project.summary}</p>{project.technologies?.length > 0 && <div className="portfolio-tech">{project.technologies.slice(0, 5).map(tag => <span key={tag}>{tag}</span>)}</div>}<a href={project.actions?.[0]?.href} target="_blank" rel="noreferrer">View repository<NeuralIcon name="arrow" /></a></article>)}{projects.length === 0 && <p>Explore the latest work on <a href={`https://github.com/${GITHUB_USERNAME}`}>GitHub</a>.</p>}</div>
        </section>
        <section id="portfolio-skills"><div className="portfolio-section-head"><h3>Technical toolkit</h3><button type="button" onClick={() => navigate("skills")}>Explore skills<NeuralIcon name="arrow" /></button></div><div className="portfolio-skill-groups">{groups.map(group => <div key={group.id}><h4>{group.label}</h4><p>{group.summary}</p><div className="portfolio-tech">{group.children.map(id => <span key={id}>{graph.nodes[id].label}</span>)}</div></div>)}</div></section>
        <section id="portfolio-experience"><div className="portfolio-section-head"><h3>Experience</h3><button type="button" onClick={() => navigate("journey")}>View experience<NeuralIcon name="arrow" /></button></div><div className="portfolio-experience">{experience.map(item => <article key={item.id}><time>{item.eyebrow}</time><div><h4>{item.title}</h4><p>{item.summary}</p><span>{item.detail}</span>{item.bullets?.[0] && <p>{item.bullets[0]}</p>}</div></article>)}</div></section>
        <footer className="portfolio-footer"><h3>Have something in mind?</h3><a href={`mailto:${EMAIL}`}>{EMAIL}<NeuralIcon name="arrow" /></a></footer>
      </div>
    </div>
  </section>;
}
