import { linkedinHighlights, LINKEDIN_URL } from "@/config/config";
import Reveal from "@/components/Reveal";
import SectionTitle from "@/components/SectionTitle";

export default function LinkedIn() {
  return (
    <section id="linkedin" className="pt-20">
      <SectionTitle
        eyebrow="Continuous Growth"
        title="Learning Journey"
        description="Highlights from my ongoing journey of mastering Machine Learning, Data Science, and modern technologies."
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
        {linkedinHighlights.map((item, index) => (
          <Reveal key={item.title} delay={index * 150} className="h-full">
            <div className="group flex h-full flex-col justify-between rounded-2xl border border-white/10 bg-white/5 p-6 shadow-glass backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-sky-400/30 hover:bg-white/10 hover:shadow-[0_15px_40px_rgba(2,132,199,0.15)]">
              <div>
                <div className="mb-4 inline-flex rounded-xl bg-sky-500/10 p-3 text-sky-400 transition-colors group-hover:bg-sky-500/20">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-sky-300 transition-colors">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">{item.description}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="mt-10 text-center">
        <a
          href={LINKEDIN_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex rounded-full border border-sky-400/30 bg-sky-500/10 px-6 py-3 text-sm font-medium text-sky-300 transition-all hover:bg-sky-500/20 hover:text-sky-200 hover:border-sky-400/50"
        >
          View Full LinkedIn Profile
        </a>
      </div>
    </section>
  );
}
