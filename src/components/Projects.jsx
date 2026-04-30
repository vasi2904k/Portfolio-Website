import { GITHUB_USERNAME } from "@/config/config";
import SectionTitle from "@/components/SectionTitle";
import ProjectList from "@/components/ProjectList";

async function fetchRepos() {
  const headers = { Accept: "application/vnd.github+json" };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`, {
    headers,
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Unable to fetch repositories right now.");
  }

  const repos = await response.json();
  if (!Array.isArray(repos)) {
    throw new Error("Unexpected data format from GitHub API.");
  }
  return repos;
}

export default async function Projects() {
  try {
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
          description="Automatically refreshed from GitHub and shown directly from your account instead of a curated subset."
        />

        <ProjectList repos={allRepos} />
      </section>
    );
  } catch (error) {
    return (
      <section id="projects" className="pt-20">
        <SectionTitle
          eyebrow="Live GitHub"
          title="All GitHub Repositories"
          description="We are unable to load repositories right now. Please try again later."
        />
        <div className="rounded-2xl border border-red-300/30 bg-red-400/10 p-6 text-sm text-red-100">
          {error.message}
        </div>
      </section>
    );
  }
}
