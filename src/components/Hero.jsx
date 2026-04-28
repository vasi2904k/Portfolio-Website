"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { GITHUB_USERNAME, LINKEDIN_URL, PROFILE } from "@/config/config";
import Reveal from "@/components/Reveal";

const githubProfile = `https://github.com/${GITHUB_USERNAME}`;

export default function Hero() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#060b13] p-7 shadow-glass backdrop-blur-xl md:p-12">
      {/* ML Data Nodes Animation Background - Optimized */}
      <motion.div 
        animate={{ y: [0, -15, 0], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-sky-500/20 blur-2xl will-change-transform" 
      />
      <motion.div 
        animate={{ y: [0, 20, 0], opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute -bottom-24 left-10 h-56 w-56 rounded-full bg-cyan-500/15 blur-2xl will-change-transform" 
      />
      
      {/* Floating Data Dots - Reduced count */}
      <div className="absolute inset-0 z-0 overflow-hidden opacity-20">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ 
              y: [0, -40, 0],
              opacity: [0, 0.6, 0],
              scale: [0.8, 1.1, 0.8]
            }}
            transition={{
              duration: 5 + i,
              repeat: Infinity,
              delay: i * 0.8,
              ease: "linear"
            }}
            className="absolute h-1 w-1 rounded-full bg-sky-400 shadow-[0_0_4px_1px_rgba(56,189,248,0.6)] will-change-transform"
            style={{ left: `${20 + i * 30}%`, top: `${80 - i * 10}%` }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
        
        {/* Left Side: Text Content */}
        <div className="w-full lg:w-[55%] flex flex-col items-start">
          <Reveal>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-900/30 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-500"></span>
              </span>
              AI / ML Portfolio
            </div>
          </Reveal>

          <Reveal delay={100}>
            <h1 className="text-4xl font-bold tracking-tight text-white md:text-6xl lg:text-7xl">
              {PROFILE.name}
            </h1>
          </Reveal>

          <Reveal delay={200}>
            <p className="mt-4 text-xl font-medium text-sky-200 md:text-2xl">
              {PROFILE.title}
            </p>
          </Reveal>

          <Reveal delay={300}>
            <p className="mt-6 max-w-2xl text-sm leading-relaxed text-slate-400 md:text-base">
              {PROFILE.tagline}
            </p>
          </Reveal>

          <Reveal delay={400}>
            <div className="mt-8 flex flex-wrap gap-3">
              <span className="tech-chip flex items-center gap-2 rounded-md px-3 py-1.5 text-[11px] uppercase tracking-[0.1em]">
                <svg className="h-3 w-3 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                ML Engineering
              </span>
              <span className="tech-chip flex items-center gap-2 rounded-md px-3 py-1.5 text-[11px] uppercase tracking-[0.1em]" style={{ animationDelay: "0.4s" }}>
                <svg className="h-3 w-3 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                Model Building
              </span>
              <span className="tech-chip flex items-center gap-2 rounded-md px-3 py-1.5 text-[11px] uppercase tracking-[0.1em]" style={{ animationDelay: "0.8s" }}>
                <svg className="h-3 w-3 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                Data Analysis
              </span>
            </div>
          </Reveal>

          <Reveal delay={500}>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <a
                href="#projects"
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-lg bg-sky-500 px-6 py-3.5 text-sm font-bold text-white shadow-[0_0_20px_rgba(14,165,233,0.3)] transition hover:shadow-[0_0_30px_rgba(14,165,233,0.6)]"
              >
                <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-150%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(150%)]">
                  <div className="relative h-full w-8 bg-white/20" />
                </div>
                <span className="relative">View Projects</span>
                <svg className="relative h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </a>
              
              <a
                href={githubProfile}
                target="_blank"
                rel="noreferrer"
                className="inline-flex rounded-lg border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                GitHub
              </a>
              
              <a
                href={LINKEDIN_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex rounded-lg border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                LinkedIn
              </a>
              
              <a
                href="#chatbot"
                className="inline-flex items-center gap-2 rounded-lg border border-sky-500/30 bg-sky-500/10 px-6 py-3.5 text-sm font-medium text-sky-300 transition hover:bg-sky-500/20 hover:text-sky-200"
              >
                <svg className="h-4 w-4 animate-pulse text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                Try AI Assistant
              </a>
            </div>
          </Reveal>
        </div>

        {/* Right Side: Profile Image */}
        <div className="flex w-full lg:w-[45%] justify-center items-center mt-8 lg:mt-0">
          <Reveal delay={200} className="w-full">
            <div className="group relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-full border border-white/10 bg-slate-900/60 shadow-[0_0_60px_rgba(14,165,233,0.2)] ring-1 ring-white/5 transition-all duration-700 hover:shadow-[0_0_80px_rgba(14,165,233,0.32)] lg:max-w-md">
              <div className="absolute inset-0 bg-gradient-to-tr from-sky-500/20 via-transparent to-cyan-400/10 mix-blend-overlay z-10 opacity-70 transition-opacity duration-500 group-hover:opacity-90" />
              <Image
                src="/profile.png"
                alt={PROFILE.name}
                fill
                priority
                className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 1024px) 80vw, 480px"
              />
            </div>
          </Reveal>
        </div>
        
      </div>
    </section>
  );
}
