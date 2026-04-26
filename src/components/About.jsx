import Reveal from "@/components/Reveal";
import SectionTitle from "@/components/SectionTitle";

export default function About() {
  return (
    <section id="about" className="pt-20">
      <SectionTitle eyebrow="About" title="Building AI That Solves Real Problems" />
      <Reveal>
        <article className="rounded-2xl border border-white/10 bg-white/5 p-7 text-sm leading-relaxed text-slate-300 shadow-glass backdrop-blur-xl md:text-base">
          I am passionate about designing machine learning systems that move from experimentation to production with
          measurable impact. My work focuses on practical AI, from training robust models to shipping inference-ready
          applications. I am continuously learning, iterating, and exploring better ways to turn data into intelligent
          decisions.
        </article>
      </Reveal>
    </section>
  );
}
