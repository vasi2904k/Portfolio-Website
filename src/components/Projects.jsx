import { GITHUB_USERNAME } from "@/config/config";
import SectionTitle from "@/components/SectionTitle";
import ProjectList from "@/components/ProjectList";
import fallbackRepos from "@/data/fallbackRepos.json";

async function fetchRepos() {
  const headers = { Accept: "application/vnd.github+json" };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  try {
    const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`, {
      headers,
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      console.warn("GitHub API rate limit or error, using fallback data.");
      return fallbackRepos;
    }

    const repos = await response.json();
    if (!Array.isArray(repos)) {
      console.warn("Unexpected GitHub API format, using fallback data.");
      return fallbackRepos;
    }
    return repos;
  } catch (error) {
    console.warn("Failed to fetch from GitHub, using fallback data:", error);
    return fallbackRepos;
  }
}

export default async function Projects() {
  const repos = await fetchRepos();
  // Sort: newest created first, then by stars, then by most recently updated
  const allRepos = [...repos].sort((a, b) => {
    const createdDiff = new Date(b.created_at) - new Date(a.created_at);
    if (createdDiff !== 0) return createdDiff;
    const starsDiff = b.stargazers_count - a.stargazers_count;
    if (starsDiff !== 0) return starsDiff;
    return new Date(b.updated_at) - new Date(a.updated_at);
  });

  return (
    <section id="projects" className="pt-20">
      <SectionTitle
        eyebrow="Live GitHub"
        title="All GitHub Repositories"
        description="A showcase of my recent machine learning projects and experiments."
      />

      <ProjectList repos={allRepos} />
    </section>
  );
}
