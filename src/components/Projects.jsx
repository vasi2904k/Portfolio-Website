import { GITHUB_USERNAME } from "@/config/config";
import SectionTitle from "@/components/SectionTitle";
import ProjectList from "@/components/ProjectList";
import fallbackRepos from "@/data/fallbackRepos.json";

async function fetchRepos() {
  const headers = { Accept: "application/vnd.github+json" };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  try {
    const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`, { headers, next: { revalidate: 3600 }, signal: AbortSignal.timeout(8000) });
    if (!response.ok) return fallbackRepos;
    const repos = await response.json();
    return Array.isArray(repos) ? repos : fallbackRepos;
  } catch { return fallbackRepos; }
}
export default async function Projects() {
  const repos = (await fetchRepos()).filter((repo) => !repo.private);
  return <section id="projects" className="content-section"><SectionTitle eyebrow="02 / SELECTED WORK" title={<>Ideas, trained<br /><span className="muted-heading">for the real world.</span></>} description="A collection of experiments, intelligent systems, and problems worth solving."><a href={`https://github.com/${GITHUB_USERNAME}`} target="_blank" rel="noreferrer" className="text-link">Explore GitHub <span aria-hidden="true">↗</span></a></SectionTitle><ProjectList repos={repos} /></section>;
}
