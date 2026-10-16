"use client";
import { EMAIL, GITHUB_USERNAME, LINKEDIN_URL, PROFILE } from "@/config/config";
import NeuralIcon, { NeuralMark } from "./NeuralIcon";

const PROJECT_STORIES = {
  "food-delivery-time-prediction": {
    problem: "Estimate food delivery time from the project data.",
    contribution: "The README documents data preprocessing, exploratory analysis, and a comparison of linear regression with a Random Forest.",
    approach: "Prepare and explore the data, establish a linear baseline, then evaluate a Random Forest against it.",
    evidence: "The README reports Random Forest R² 0.7341 and MAE 13.5517, versus linear regression R² −0.0323 and MAE 26.5619. These are repository-reported results; the notebook has not been rerun for this page.",
  },
  "decision-tree-regression": {
    problem: "Explore decision tree regression and how tuning changes train and test performance.",
    contribution: "The README documents base and tuned train/test R² comparisons using GridSearchCV.",
    approach: "Compare an untuned tree with a GridSearchCV-tuned model and review the train/test scores for generalization.",
    evidence: "The README reports base and tuned train/test R² scores. Exact values are not reproduced here because they have not been checked against the notebook outputs.",
  },
  "agrolens-ai": {
    problem: "Detect crop disease from images.",
    contribution: "The README lists Vasi Khan among three maintainers; it does not assign individual tasks.",
    approach: "A six-notebook workflow covers image preparation, model training, and loss analysis.",
    evidence: "The README documents the workflow and team maintainers. It does not report a model performance metric.",
  },
};

const STORY_ORDER = Object.keys(PROJECT_STORIES);

function repositoryName(project) {
  const href = project.actions?.find(action => action.href?.includes("github.com/"))?.href;
  if (!href) return "";
  try { return new URL(href).pathname.split("/").filter(Boolean).at(-1)?.toLowerCase() || ""; }
  catch { return ""; }
}

export default function RecruiterOverview({ graph, onNavigate, onClose }) {
  const availableProjects = new Map(graph.order.map(id => graph.nodes[id])
    .filter(node => node.kind === "project")
    .map(project => [repositoryName(project), project]));
  const projects = STORY_ORDER.map(name => availableProjects.get(name)).filter(Boolean);
  const experience = graph.order.map(id => graph.nodes[id]).filter(node => node.kind === "experience");
  const groups = graph.nodes.skills.children.map(id => graph.nodes[id]);
  const navigate = id => { onClose(false); onNavigate(id); };
  return <section id="recruiter-overview" className="recruiter-overview human-portfolio" data-network-ui role="dialog" aria-modal="true" aria-label="Recruiter overview">
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
          <div className="portfolio-projects">{projects.map(project => {
            const story = PROJECT_STORIES[repositoryName(project)];
            return <article key={project.id}>
              <div className="portfolio-project-meta">{project.projectCategory || "Project"}<span>Selected</span></div>
              <h4>{project.title}</h4>
              <dl className="portfolio-project-story">
                <div><dt>Problem</dt><dd>{story.problem}</dd></div>
                <div><dt>Contribution documented</dt><dd>{story.contribution}</dd></div>
                <div><dt>Approach</dt><dd>{story.approach}</dd></div>
                <div><dt>Evidence</dt><dd>{story.evidence}</dd></div>
              </dl>
              {project.technologies?.length > 0 && <div className="portfolio-tech">{project.technologies.slice(0, 5).map(tag => <span key={tag}>{tag}</span>)}</div>}
              <a href={project.actions?.find(action => action.href?.includes("github.com/"))?.href} target="_blank" rel="noreferrer">View repository<NeuralIcon name="arrow" /></a>
            </article>;
          })}{projects.length === 0 && <p>Explore the latest work on <a href={`https://github.com/${GITHUB_USERNAME}`}>GitHub</a>.</p>}</div>
        </section>
        <section id="portfolio-skills"><div className="portfolio-section-head"><h3>Technical toolkit</h3><button type="button" onClick={() => navigate("skills")}>Explore skills<NeuralIcon name="arrow" /></button></div><div className="portfolio-skill-groups">{groups.map(group => <div key={group.id}><h4>{group.label}</h4><p>{group.summary}</p><div className="portfolio-tech">{group.children.map(id => <span key={id}>{graph.nodes[id].label}</span>)}</div></div>)}</div></section>
        <section id="portfolio-experience"><div className="portfolio-section-head"><h3>Experience</h3><button type="button" onClick={() => navigate("journey")}>View experience<NeuralIcon name="arrow" /></button></div><div className="portfolio-experience">{experience.map(item => <article key={item.id}><time>{item.eyebrow}</time><div><h4>{item.title}</h4><p>{item.summary}</p><span>{item.detail}</span>{item.bullets?.[0] && <p>{item.bullets[0]}</p>}</div></article>)}</div></section>
        <footer className="portfolio-footer"><h3>Have something in mind?</h3><a href={`mailto:${EMAIL}`}>{EMAIL}<NeuralIcon name="arrow" /></a></footer>
      </div>
    </div>
  </section>;
}
