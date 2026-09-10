import Link from "next/link";
import { EMAIL, GITHUB_USERNAME, LINKEDIN_URL, PROFILE, experienceData } from "@/config/config";
import styles from "./resume.module.css";

const skillGroups = [
  ["Data", "Python, Pandas, NumPy, SQL, exploratory data analysis, preprocessing"],
  ["Machine learning", "Scikit-learn, XGBoost, regression, classification, feature engineering, model training, validation, error analysis"],
  ["AI systems", "PyTorch, neural networks, language-model exploration, APIs, workflow automation"],
  ["Product engineering", "Next.js, React, Three.js, accessible interaction design, GitHub integration"],
];

const projects = [
  ["AgroLens AI", "Computer-vision system for crop-disease detection, published as a documented machine-learning project."],
  ["E-commerce Analysis", "Data preparation, feature engineering, exploratory analysis, visualization, Pandas, and scikit-learn workflows for e-commerce data."],
  ["Neural Portfolio", "Interactive 3D neural-network portfolio with deterministic navigation, accessible fallbacks, and automatic GitHub project synchronization."],
];

export const metadata = {
  title: `${PROFILE.name} - Resume`,
  description: `${PROFILE.title} resume, experience, selected projects, and technical skills.`,
};

export default function ResumePage() {
  return <main className={styles.viewport}>
    <article className={styles.sheet}>
      <header className={styles.header}>
        <p className={styles.kicker}>MACHINE LEARNING ENGINEER</p>
        <h1>{PROFILE.name}</h1>
        <nav aria-label="Contact links">
          <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
          <a href={`https://github.com/${GITHUB_USERNAME}`}>github.com/{GITHUB_USERNAME}</a>
          <a href={LINKEDIN_URL}>linkedin.com/in/mohammed-vasi-khan</a>
        </nav>
      </header>
      <div className={styles.columns}>
        <div className={styles.primary}>
          <section>
            <h2>Experience</h2>
            {experienceData.map(job => <article className={styles.entry} key={`${job.company}-${job.date}`}>
              <div><h3>{job.title}</h3><span>{job.date}</span></div>
              <p className={styles.meta}>{job.company} | {job.location}</p>
              <p>{job.description.join(" ")}</p>
            </article>)}
          </section>
          <section>
            <h2>Selected projects</h2>
            {projects.map(([name, summary]) => <article className={styles.project} key={name}>
              <h3>{name}</h3><p>{summary}</p>
            </article>)}
          </section>
        </div>
        <aside>
          <section>
            <h2>Profile</h2>
            <p>{PROFILE.tagline}. Experience across modeling, data workflows, customer operations, brand reputation, and autonomous-delivery support.</p>
          </section>
          <section>
            <h2>Core skills</h2>
            {skillGroups.map(([name, skills]) => <div className={styles.skill} key={name}><h3>{name}</h3><p>{skills}</p></div>)}
          </section>
          <section>
            <h2>Working style</h2>
            <ul><li>Start with the problem and the people it affects.</li><li>Establish useful data and model baselines.</li><li>Evaluate honestly and document decisions.</li><li>Build reliable systems with clear communication.</li></ul>
          </section>
          <section>
            <h2>Technical focus</h2>
            <ul><li>Practical machine learning for real-world problems.</li><li>Reproducible experimentation and thoughtful validation.</li><li>Interfaces that turn AI experiments into useful tools.</li></ul>
          </section>
          <section className={styles.availability}>
            <h2>Connect</h2>
            <p>Open to machine-learning opportunities, engineering conversations, and thoughtful collaborations.</p>
          </section>
        </aside>
      </div>
      <footer><Link href="/">Interactive portfolio</Link><span>vasi-khan-neural-portfolio.foamy-tapir-7760.chatgpt.site</span><span>1 / 1</span></footer>
    </article>
  </main>;
}
