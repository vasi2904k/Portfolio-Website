import { GITHUB_SYNC, GITHUB_USERNAME, PROJECT_OVERRIDES } from "@/config/config";
import fallbackRepos from "@/data/fallbackRepos.json";
import { classifyProject, stableProjectId } from "@/utils/projectClassifier.mjs";
import { createProjectRecord } from "@/utils/readmeProject.mjs";

const API_VERSION = "2022-11-28";
const GRAPHQL_QUERY = `
  query PortfolioRepositories($login: String!) {
    user(login: $login) {
      repositories(first: 100, ownerAffiliations: OWNER, privacy: PUBLIC, isFork: false, orderBy: { field: UPDATED_AT, direction: DESC }) {
        nodes {
          id databaseId name nameWithOwner url description homepageUrl
          isArchived isDisabled isFork updatedAt pushedAt createdAt
          stargazerCount forkCount diskUsage
          primaryLanguage { name }
          repositoryTopics(first: 20) { nodes { topic { name } } }
          languages(first: 10, orderBy: { field: SIZE, direction: DESC }) { edges { size node { name } } }
          readme: object(expression: "HEAD:README.md") { ... on Blob { text } }
        }
      }
    }
  }`;

const headers = token => ({
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": API_VERSION,
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

async function fetchGraphqlRepositories(token) {
  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { ...headers(token), "Content-Type": "application/json" },
    body: JSON.stringify({ query: GRAPHQL_QUERY, variables: { login: GITHUB_USERNAME } }),
    next: { revalidate: GITHUB_SYNC.revalidateSeconds },
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) throw new Error(`GitHub GraphQL returned ${response.status}`);
  const payload = await response.json();
  if (payload.errors?.length || !payload.data?.user) throw new Error("GitHub GraphQL response was incomplete");
  return payload.data.user.repositories.nodes.map(repo => ({
    id: repo.databaseId || repo.id,
    node_id: repo.id,
    name: repo.name,
    full_name: repo.nameWithOwner,
    html_url: repo.url,
    description: repo.description,
    homepage: repo.homepageUrl,
    language: repo.primaryLanguage?.name || null,
    languages: Object.fromEntries((repo.languages?.edges || []).map(edge => [edge.node.name, edge.size])),
    topics: (repo.repositoryTopics?.nodes || []).map(item => item.topic.name),
    archived: repo.isArchived,
    disabled: repo.isDisabled,
    fork: repo.isFork,
    updated_at: repo.updatedAt,
    pushed_at: repo.pushedAt,
    created_at: repo.createdAt,
    stargazers_count: repo.stargazerCount,
    forks_count: repo.forkCount,
    size: repo.diskUsage,
    readme: repo.readme?.text || "",
  }));
}

async function fetchText(url, requestHeaders) {
  try {
    const response = await fetch(url, {
      headers: requestHeaders,
      next: { revalidate: GITHUB_SYNC.revalidateSeconds },
      signal: AbortSignal.timeout(6000),
    });
    return response.ok ? response.text() : "";
  } catch { return ""; }
}

async function fetchJson(url, requestHeaders) {
  try {
    const response = await fetch(url, {
      headers: requestHeaders,
      next: { revalidate: GITHUB_SYNC.revalidateSeconds },
      signal: AbortSignal.timeout(6000),
    });
    return response.ok ? response.json() : {};
  } catch { return {}; }
}

async function fetchRestRepositories(token) {
  const requestHeaders = headers(token);
  const response = await fetch(
    `https://api.github.com/users/${GITHUB_USERNAME}/repos?type=owner&per_page=100&sort=updated&direction=desc`,
    { headers: requestHeaders, next: { revalidate: GITHUB_SYNC.revalidateSeconds }, signal: AbortSignal.timeout(8000) }
  );
  if (!response.ok) throw new Error(`GitHub REST returned ${response.status}`);
  const repositories = await response.json();
  if (!Array.isArray(repositories)) throw new Error("GitHub REST response was incomplete");

  const limit = token ? repositories.length : GITHUB_SYNC.anonymousEnrichmentLimit;
  const candidates = repositories
    .filter(repo => !repo.private && !repo.fork && !repo.disabled)
    .sort((a, b) => Number(!!PROJECT_OVERRIDES[b.name]) - Number(!!PROJECT_OVERRIDES[a.name]) || new Date(b.updated_at) - new Date(a.updated_at))
    .slice(0, limit);
  const enriched = new Map(await Promise.all(candidates.map(async repo => {
    const fullName = encodeURI(repo.full_name || `${GITHUB_USERNAME}/${repo.name}`);
    const [readme, languages] = await Promise.all([
      fetchText(`https://api.github.com/repos/${fullName}/readme`, { ...requestHeaders, Accept: "application/vnd.github.raw+json" }),
      fetchJson(`https://api.github.com/repos/${fullName}/languages`, requestHeaders),
    ]);
    return [String(repo.id ?? repo.node_id ?? repo.full_name), { readme, languages }];
  })));
  return repositories.map(repo => ({ ...repo, ...(enriched.get(String(repo.id ?? repo.node_id ?? repo.full_name)) || {}) }));
}

function prepareProjects(repositories) {
  const unique = new Map();
  for (const repo of repositories) {
    if (!repo || repo.private || repo.fork) continue;
    const classification = classifyProject({ ...repo, readmeLength: repo.readme?.length || 0 });
    const project = createProjectRecord({ ...repo, classification });
    unique.set(stableProjectId(project), project);
  }
  return [...unique.values()].sort((a, b) => a.priority - b.priority || new Date(b.updated_at || 0) - new Date(a.updated_at || 0));
}

export async function getPortfolioRepositories() {
  const token = process.env.GITHUB_TOKEN;
  try {
    const repositories = token ? await fetchGraphqlRepositories(token) : await fetchRestRepositories(token);
    return prepareProjects(repositories);
  } catch {
    try { return prepareProjects(await fetchRestRepositories(token)); }
    catch { return prepareProjects(fallbackRepos); }
  }
}
