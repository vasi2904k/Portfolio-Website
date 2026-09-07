import { PROFILE, GITHUB_USERNAME, LINKEDIN_URL } from "@/config/config";
import NeuralExperience from "@/components/NeuralExperience";

export default function Hero() {
  return (
    <section id="home" className="hero district">
      <div className="hero-coordinate mono" aria-hidden="true">PORTFOLIO / VASI KHAN <span>EST. 2026 — INDIA</span></div>
      <div className="hero-layout">
        <div className="hero-copy">
          <p className="eyebrow hero-enter"><span className="status-dot" /> MACHINE LEARNING ENGINEER</p>
          <h1 className="hero-enter delay-1">Engineering<br />intelligence.<br /><span className="gradient-text">Building tomorrow.</span></h1>
          <p className="hero-name hero-enter delay-2">Hello, I’m <strong>{PROFILE.name}.</strong></p>
          <p className="hero-description hero-enter delay-2">Turning complex data into real-world possibilities.<br className="desktop-break" /> Exploring the intersection of machine learning,<br className="desktop-break" /> thoughtful engineering, and what comes next.</p>
          <div className="hero-actions hero-enter delay-3">
            <a href="#projects" className="button button-primary">Explore my work <span aria-hidden="true">↗</span></a>
            <a href="#contact" className="button button-secondary">Let’s connect <span aria-hidden="true">↗</span></a>
          </div>
          <div className="hero-socials mono hero-enter delay-3"><span>FIND ME ON</span><a href={`https://github.com/${GITHUB_USERNAME}`} target="_blank" rel="noreferrer">GITHUB ↗</a><a href={LINKEDIN_URL} target="_blank" rel="noreferrer">LINKEDIN ↗</a></div>
        </div>
        <NeuralExperience />
      </div>
      <div className="hero-bottom mono"><a href="#about"><span className="scroll-indicator" aria-hidden="true" /> SCROLL TO EXPLORE</a><span>A LITTLE CURIOSITY. A LOT OF POSSIBILITIES.</span><span className="hero-sector">SECTOR 01 / 06</span></div>
    </section>
  );
}
