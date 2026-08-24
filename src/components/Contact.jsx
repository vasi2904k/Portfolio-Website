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
        <div className="surface grid gap-4 p-4 md:grid-cols-3 md:p-6">
          <a
            href={`mailto:${EMAIL}`}
            className="border border-[#26313e] bg-[#080b10] p-4 transition hover:border-[#b8f35c]"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Email</p>
            <p className="mt-2 text-sm text-white">{EMAIL}</p>
          </a>

          <a
            href={`https://github.com/${GITHUB_USERNAME}`}
            target="_blank"
            rel="noreferrer"
            className="border border-[#26313e] bg-[#080b10] p-4 transition hover:border-[#b8f35c]"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">GitHub</p>
            <p className="mt-2 text-sm text-white">github.com/{GITHUB_USERNAME}</p>
          </a>

          <a
            href={LINKEDIN_URL}
            target="_blank"
            rel="noreferrer"
            className="border border-[#26313e] bg-[#080b10] p-4 transition hover:border-[#b8f35c]"
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
