import { Suspense } from "react";
import About from "@/components/About";
import Contact from "@/components/Contact";
import Hero from "@/components/Hero";
import Experience from "@/components/Experience";
import LinkedIn from "@/components/LinkedIn";
import PortfolioChatbot from "@/components/PortfolioChatbot";
import Projects from "@/components/Projects";
import ProjectsSkeleton from "@/components/ProjectsSkeleton";
import Skills from "@/components/Skills";
import TopNav from "@/components/TopNav";

export default function HomePage() {
  return (
    <main className="relative mx-auto min-h-screen w-full max-w-6xl px-4 pb-20 pt-6 md:px-8 md:pt-10">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[45vh] bg-gradient-to-b from-sky-500/12 via-cyan-400/5 to-transparent" />
      <TopNav />
      <Hero />
      <About />
      <PortfolioChatbot />
      <Suspense
        fallback={
          <section id="projects" className="pt-20">
            <ProjectsSkeleton />
          </section>
        }
      >
        <Projects />
      </Suspense>
      <Skills />
      <Experience />
      <LinkedIn />
      <Contact />
    </main>
  );
}
