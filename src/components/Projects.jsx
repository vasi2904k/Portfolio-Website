import { GITHUB_USERNAME } from "@/config/config";
import SectionTitle from "@/components/SectionTitle";
import ProjectList from "@/components/ProjectList";
import { getPortfolioRepositories } from "@/data/repositories";

export default async function Projects() {
  const repos = (await getPortfolioRepositories()).filter(repo => !repo.hidden);
  return <section id="projects" className="content-section"><SectionTitle eyebrow="02 / SELECTED WORK" title={<>Ideas, trained<br /><span className="muted-heading">for the real world.</span></>} description="A collection of experiments, intelligent systems, and problems worth solving."><a href={`https://github.com/${GITHUB_USERNAME}`} target="_blank" rel="noreferrer" className="text-link">Explore GitHub <span aria-hidden="true">↗</span></a></SectionTitle><ProjectList repos={repos} /></section>;
}
