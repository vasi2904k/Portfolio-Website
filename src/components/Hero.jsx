import Image from "next/image";
import { GITHUB_USERNAME, LINKEDIN_URL, PROFILE } from "@/config/config";

export default function Hero() {
  return <section className="surface relative overflow-hidden p-6 md:p-10">
    <div className="absolute right-0 top-0 h-28 w-28 border-b border-l border-[#26313e]" />
    <div className="grid items-center gap-10 lg:grid-cols-[1.25fr_.75fr]"><div>
      <div className="hero-enter technical-label flex items-center gap-2"><span className="h-2 w-2 bg-[#b8f35c]" />System status / available for work</div>
      <p className="hero-enter delay-1 mt-8 font-mono text-xs tracking-[.15em] text-slate-500">USER_ID / VASI_KHAN — ROLE_LOADED</p>
      <h1 className="hero-enter delay-2 mt-3 max-w-3xl text-5xl font-medium leading-[.92] text-[#f0f2ed] md:text-7xl">Mohammed<br /><span className="text-[#b8f35c]">Vasi Khan.</span></h1>
      <p className="hero-enter delay-3 mt-6 text-lg text-slate-300 md:text-xl">{PROFILE.title}</p><p className="hero-enter delay-3 mt-3 max-w-xl text-sm leading-7 text-slate-400 md:text-base">{PROFILE.tagline}</p>
      <div className="hero-enter delay-4 mt-8 flex flex-wrap gap-3"><a href="#projects" className="bg-[#b8f35c] px-5 py-3 text-sm font-semibold text-[#080b10] transition-transform hover:translate-x-1">Explore experiments →</a><a href={`https://github.com/${GITHUB_USERNAME}`} target="_blank" rel="noreferrer" className="border border-[#26313e] px-5 py-3 text-sm text-slate-200 transition-colors hover:border-[#b8f35c]">GitHub ↗</a><a href={LINKEDIN_URL} target="_blank" rel="noreferrer" className="border border-[#26313e] px-5 py-3 text-sm text-slate-200 transition-colors hover:border-[#b8f35c]">LinkedIn ↗</a></div>
    </div><div className="hero-enter delay-2 border border-[#26313e] bg-[#0a0f16] p-3"><div className="relative aspect-[4/5] overflow-hidden border border-[#26313e]"><Image src="/profile.png" alt={PROFILE.name} fill priority sizes="(max-width:1024px) 90vw, 420px" className="object-cover" /></div><div className="grid grid-cols-2 gap-x-4 gap-y-2 border-x border-b border-[#26313e] p-3 font-mono text-[10px] tracking-[.08em] text-slate-400"><span>USER_ID: VASI_KHAN</span><span>STATUS: ACTIVE</span><span className="col-span-2">FOCUS: ML SYSTEMS / DATA / AUTOMATION</span></div></div></div>
  </section>;
}
