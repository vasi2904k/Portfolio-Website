"use client";

import { experienceData } from "@/config/config";
import SectionTitle from "@/components/SectionTitle";
import Reveal from "@/components/Reveal";
import TiltCard from "@/components/TiltCard";

export default function Experience() {
  if (!experienceData || experienceData.length === 0) return null;

  return (
    <section id="experience" className="pt-20">
      <SectionTitle
        eyebrow="Professional Timeline"
        title="Work Experience"
        description="A journey through my professional roles, highlighting key responsibilities and impact."
      />

      <div className="relative border-l border-white/10 pl-6 md:pl-8 ml-4 md:ml-6 mt-8">
        {experienceData.map((job, index) => (
          <Reveal key={`${job.company}-${index}`} delay={index * 100} className="mb-10 last:mb-0">
            <div className="group relative" style={{ perspective: "1000px" }}>
              {/* Timeline dot */}
              <span className="absolute -left-[2.1rem] top-2 h-4 w-4 rounded-full border-2 border-sky-400 bg-slate-950 transition-colors duration-300 group-hover:bg-sky-400 md:-left-[2.7rem]" />
              
              <TiltCard>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-glass backdrop-blur-xl transition-all duration-300 hover:border-sky-300/30 hover:bg-white/10 hover:shadow-[0_15px_40px_rgba(2,132,199,0.15)]">
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between" style={{ transform: "translateZ(30px)" }}>
                    <div>
                      <h3 className="text-xl font-bold text-white group-hover:text-sky-300 transition-colors">{job.title}</h3>
                      <p className="mt-1 text-base font-medium text-slate-300">{job.company}</p>
                    </div>
                    <div className="flex flex-col items-start md:items-end gap-1">
                      <span className="rounded-full bg-sky-500/10 px-3 py-1 text-sm font-medium text-sky-200 border border-sky-500/20">
                        {job.date}
                      </span>
                      <span className="text-sm text-slate-400">{job.location}</span>
                    </div>
                  </div>

                  <ul className="mt-5 space-y-2" style={{ transform: "translateZ(20px)" }}>
                    {job.description.map((point, i) => (
                      <li key={i} className="flex text-sm text-slate-300 leading-relaxed">
                        <span className="mr-3 text-sky-400 mt-1">▹</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </TiltCard>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
