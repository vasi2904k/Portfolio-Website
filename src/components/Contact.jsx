import { EMAIL, GITHUB_USERNAME, LINKEDIN_URL } from "@/config/config";
import SectionTitle from "@/components/SectionTitle";
import Reveal from "@/components/Reveal";

export default function Contact() {
  return (
    <section id="contact" className="pt-20 pb-8">
      <SectionTitle
        eyebrow="Contact"
        title="Let’s Build Intelligent Systems Together"
        description="Open to impactful AI engineering opportunities, ML collaborations, and portfolio conversations."
      />

      <Reveal>
        <div className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-glass backdrop-blur-xl md:grid-cols-3">
          <a
            href={`mailto:${EMAIL}`}
            className="rounded-xl border border-white/10 bg-black/20 p-4 transition hover:border-sky-300/40"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Email</p>
            <p className="mt-2 text-sm text-white">{EMAIL}</p>
          </a>

          <a
            href={`https://github.com/${GITHUB_USERNAME}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-white/10 bg-black/20 p-4 transition hover:border-sky-300/40"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">GitHub</p>
            <p className="mt-2 text-sm text-white">github.com/{GITHUB_USERNAME}</p>
          </a>

          <a
            href={LINKEDIN_URL}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-white/10 bg-black/20 p-4 transition hover:border-sky-300/40"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">LinkedIn</p>
            <p className="mt-2 text-sm text-white">mohammed-vasi-khan</p>
          </a>
        </div>

        <div className="mt-16 text-center text-sm text-slate-500">
          Built by Mohammed Vasi Khan
        </div>
      </Reveal>
    </section>
  );
}
