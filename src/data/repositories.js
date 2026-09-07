import { GITHUB_USERNAME } from "@/config/config";
import fallbackRepos from "@/data/fallbackRepos.json";

export async function getPortfolioRepositories() {
  const headers = { Accept: "application/vnd.github+json" };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  try {
    const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`, { headers, next: { revalidate: 3600 }, signal: AbortSignal.timeout(8000) });
    if (!response.ok) return fallbackRepos;
    const data = await response.json();
    return Array.isArray(data) ? data.filter(repo => !repo.private) : fallbackRepos;
  } catch { return fallbackRepos; }
}
