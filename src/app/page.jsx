import { Suspense, lazy } from "react";
import About from "@/components/About";
import Contact from "@/components/Contact";
import Hero from "@/components/Hero";
import Experience from "@/components/Experience";
import TopNav from "@/components/TopNav";
import ProjectsSkeleton from "@/components/ProjectsSkeleton";

// Dynamic imports for heavy components
const LinkedIn = lazy(() => import("@/components/LinkedIn"));
const PortfolioChatbot = lazy(() => import("@/components/PortfolioChatbot"));
const Projects = lazy(() => import("@/components/Projects"));
const Skills = lazy(() => import("@/components/Skills"));

export default function HomePage() {
  return (
    <main className="relative mx-auto min-h-screen w-full max-w-6xl px-4 pb-20 pt-6 md:px-8 md:pt-10">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[45vh] bg-gradient-to-b from-sky-500/12 via-cyan-400/5 to-transparent" />
      <TopNav />
      <Hero />
      <About />
      <Suspense fallback={<div className="h-20" />}>
        <PortfolioChatbot />
      </Suspense>
      <Suspense
        fallback={
          <section id="projects" className="pt-20">
            <ProjectsSkeleton />
          </section>
        }
      >
        <Projects />
      </Suspense>
      <Suspense fallback={<div className="h-20" />}>
        <Skills />
      </Suspense>
      <Suspense fallback={<div className="h-20" />}>
        <Experience />
      </Suspense>
      <Suspense fallback={<div className="h-20" />}>
        <LinkedIn />
      </Suspense>
      <Contact />
    </main>
  );
}
