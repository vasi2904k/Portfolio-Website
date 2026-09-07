import Image from "next/image";
import { PROFILE } from "@/config/config";
import Reveal from "@/components/Reveal";
import TiltCard from "@/components/TiltCard";
import SectionTitle from "@/components/SectionTitle";

export default function About() {
  return <section id="about" className="content-section">
    <SectionTitle eyebrow="01 / THE HUMAN BEHIND THE NETWORK" title={<>Curiosity is my<br /><span className="muted-heading">activation function.</span></>} />
    <div className="about-layout">
      <Reveal><TiltCard max={4}><div className="identity-card"><div className="identity-photo"><Image src="/profile.png" alt={PROFILE.name} fill sizes="(max-width: 760px) 280px, 330px" className="object-cover" /><div className="photo-grid" aria-hidden="true" /></div><div className="identity-footer"><span className="mono">MVK / ENGINEER</span><span className="status-dot" /></div><div className="identity-corner" aria-hidden="true" /></div></TiltCard></Reveal>
      <Reveal className="about-copy" delay={100}><p className="about-lead">I connect the dots between<br /><span>data, ideas, and impact.</span></p><p>I’m Mohammed Vasi Khan, a machine learning engineer who loves turning messy, complex problems into useful systems. My work spans data exploration, predictive modeling, and AI applications that make a difference beyond a notebook.</p><p>My path through business, customer experience, and autonomous systems has taught me to start with people and the problems they need solved. Today, I bring that perspective to every dataset and model I build.</p><div className="about-principles"><div><span className="principle-icon" aria-hidden="true">01</span><strong>Think deeply.</strong><span>Understand the problem.</span></div><div><span className="principle-icon" aria-hidden="true">02</span><strong>Build deliberately.</strong><span>Experiment with purpose.</span></div><div><span className="principle-icon" aria-hidden="true">03</span><strong>Keep learning.</strong><span>Improve with every iteration.</span></div></div><div className="location-line mono"><span className="status-dot" /> BASED IN INDIA <span>·</span> CONNECTED TO THE WORLD</div></Reveal>
    </div>
  </section>;
}
