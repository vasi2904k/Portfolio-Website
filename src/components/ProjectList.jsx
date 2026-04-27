"use client";

import { useState } from "react";
import Image from "next/image";
import Reveal from "@/components/Reveal";
import TiltCard from "@/components/TiltCard";
import { PROJECT_IMAGES, GITHUB_USERNAME } from "@/config/config";

function normalizeRepoName(value) {
  return (value || "")
    .normalize("NFKD")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, "");
}

function getProjectImage(repoName) {
  if (PROJECT_IMAGES?.[repoName]) {
    return PROJECT_IMAGES[repoName];
  }

  const normalizedName = normalizeRepoName(repoName);
  const entry = Object.entries(PROJECT_IMAGES || {}).find(([name]) => normalizeRepoName(name) === normalizedName);
  return entry ? entry[1] : null;
}

export default function ProjectList({ repos }) {
  const [showAll, setShowAll] = useState(false);
  
  // Show 3 by default
  const visibleRepos = showAll ? repos : repos.slice(0, 3);

  return (
    <>
      <div className="flex flex-col gap-8 mt-6">
        {visibleRepos.map((repo, index) => (
          <Reveal key={repo.id} delay={(index % 3) * 100}>
            <a href={repo.html_url} target="_blank" rel="noreferrer" className="block outline-none rounded-2xl ring-sky-400 focus-visible:ring-2" style={{ perspective: "1000px" }}>
              <TiltCard>
                <article className="ml-card group flex flex-col md:flex-row overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-glass backdrop-blur-xl transition-all duration-500 hover:border-sky-300/40 hover:bg-white/10 hover:shadow-[0_15px_50px_rgba(2,132,199,0.2)]">
                  <div className="relative aspect-[16/9] w-full md:w-[45%] shrink-0 overflow-hidden border-b md:border-b-0 md:border-r border-white/10 bg-slate-900/70" style={{ transform: "translateZ(30px)" }}>
                    {getProjectImage(repo.name) ? (
                      <Image
                        src={getProjectImage(repo.name)}
                        alt={`${repo.name} cover image`}
                        fill={true}
                        className="object-cover transition-transform duration-500 group-hover:scale-105 group-hover:brightness-110"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-sky-500/25 via-slate-900 to-orange-500/20 p-4 text-center text-sm font-medium text-slate-200">
                        {repo.name}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-6 md:p-8 justify-center" style={{ transform: "translateZ(40px)" }}>
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-xl md:text-2xl font-bold leading-snug text-white group-hover:text-sky-300 transition-colors">{repo.name}</h3>
                      <span className="shrink-0 rounded-full border border-amber-200/40 bg-amber-400/10 px-3 py-1 text-xs text-amber-100">
                        {repo.stargazers_count} stars
                      </span>
                    </div>

                    <p className="mt-4 flex-1 text-sm md:text-base leading-relaxed text-slate-300">
                      {repo.description || "No description provided yet."}
                    </p>

                    <div className="mt-6 flex items-center justify-between">
                      <div className="text-xs uppercase tracking-[0.16em] text-slate-400 font-medium">
                        {repo.language || "Language not specified"}
                      </div>

                      <span
                        className="inline-flex items-center gap-2 text-sm font-medium text-sky-300 transition group-hover:text-sky-200"
                      >
                        View Source
                        <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </span>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-2 pt-6 border-t border-white/5">
                      {(repo.topics || []).slice(0, 5).map((topic) => (
                        <span
                          key={topic}
                          className="rounded-full border border-sky-300/20 bg-sky-400/5 px-3 py-1.5 text-xs text-sky-200 transition-colors group-hover:bg-sky-400/15 group-hover:border-sky-300/40"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              </TiltCard>
            </a>
          </Reveal>
        ))}
      </div>

      {repos.length > 3 && (
        <div className="mt-12 flex flex-col items-center gap-4">
          <button
            onClick={() => setShowAll(!showAll)}
            className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-8 py-3.5 text-sm font-medium text-sky-300 transition-all hover:bg-sky-500/20 hover:text-sky-200 hover:border-sky-400/50 hover:shadow-[0_0_20px_rgba(56,189,248,0.15)]"
          >
            {showAll ? "Show Less Projects" : `Show All Projects (${repos.length})`}
            <svg className={`h-4 w-4 transition-transform ${showAll ? "rotate-180" : "rotate-0"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          <a
            href={`https://github.com/${GITHUB_USERNAME}`}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-slate-500 transition hover:text-slate-300 underline decoration-white/10 underline-offset-4 hover:decoration-white/30"
          >
            View Full GitHub Profile
          </a>
        </div>
      )}
    </>
  );
}
