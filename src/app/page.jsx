import { Suspense, lazy } from "react";
import About from "@/components/About";
import Contact from "@/components/Contact";
import Hero from "@/components/Hero";
import Experience from "@/components/Experience";
import TopNav from "@/components/TopNav";
import ProjectsSkeleton from "@/components/ProjectsSkeleton";
import Background3DScene from "@/components/Background3DScene";
import Spotlight from "@/components/Spotlight";

// Dynamic imports for heavy components
const LinkedIn = lazy(() => import("@/components/LinkedIn"));
const Projects = lazy(() => import("@/components/Projects"));
const Skills = lazy(() => import("@/components/Skills"));

export default function HomePage() {
  return (
    <>
      <Background3DScene />
      <Spotlight />
      <main className="relative z-10 mx-auto min-h-screen w-full max-w-6xl px-4 pb-20 pt-4 md:px-8 md:pt-8">
      <TopNav />
      <Hero />
      <About />
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
    </>
  );
}
