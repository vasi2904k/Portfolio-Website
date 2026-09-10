import { GITHUB_SYNC, GITHUB_USERNAME, PROJECT_OVERRIDES } from "@/config/config";
import { mergeProjectSnapshots } from "@/utils/projectRecords.mjs";

const API_HEADERS = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
};

async function responseValue(fetcher, url, options, fallback, asText = false) {
  try {
    const response = await fetcher(url, options);
    if (!response.ok) return { value: fallback, available: false };
    return { value: asText ? await response.text() : await response.json(), available: true };
  } catch {
    return { value: fallback, available: false };
  }
}

async function mapConcurrent(items, concurrency, mapper) {
  const results = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await mapper(items[index]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
  return results;
}

/** Refreshes a static deployment directly from GitHub without exposing a token. */
export async function fetchLivePortfolioProjects(previousProjects = [], { fetcher = fetch, signal } = {}) {
  const list = await fetcher(
    `https://api.github.com/users/${GITHUB_USERNAME}/repos?type=owner&per_page=100&sort=updated&direction=desc`,
    { headers: API_HEADERS, signal }
  );
  if (!list.ok) throw new Error(`GitHub REST returned ${list.status}`);
  const repositories = await list.json();
  if (!Array.isArray(repositories)) throw new Error("GitHub REST response was incomplete");

  const candidates = repositories
    .filter(repo => !repo.private && !repo.fork && !repo.disabled)
    .sort((a, b) => Number(!!PROJECT_OVERRIDES[b.name]) - Number(!!PROJECT_OVERRIDES[a.name]) || new Date(b.updated_at) - new Date(a.updated_at))
    .slice(0, GITHUB_SYNC.anonymousEnrichmentLimit);

  const enriched = new Map(await mapConcurrent(candidates, 4, async repo => {
    const fullName = encodeURI(repo.full_name || `${GITHUB_USERNAME}/${repo.name}`);
    const [readme, languages] = await Promise.all([
      responseValue(fetcher, `https://api.github.com/repos/${fullName}/readme`, { headers: { ...API_HEADERS, Accept: "application/vnd.github.raw+json" }, signal }, "", true),
      responseValue(fetcher, `https://api.github.com/repos/${fullName}/languages`, { headers: API_HEADERS, signal }, {}),
    ]);
    return [String(repo.id ?? repo.node_id ?? repo.full_name), {
      readme: readme.value,
      languages: languages.value,
      syncEnriched: readme.available || languages.available,
    }];
  }));

  const current = repositories.map(repo => ({
    ...repo,
    ...(enriched.get(String(repo.id ?? repo.node_id ?? repo.full_name)) || {}),
  }));
  return mergeProjectSnapshots(current, previousProjects);
}
