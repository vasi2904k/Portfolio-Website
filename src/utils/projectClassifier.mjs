import { FEATURED_TOPICS, HIDDEN_TOPICS, PROJECT_OVERRIDES, TOPIC_CATEGORIES } from "@/config/config";

const SUBCATEGORY_TOPICS = [
  "rag", "llm", "computer-vision", "nlp", "deep-learning", "classification",
  "regression", "time-series", "eda", "data-visualization", "api", "nextjs",
];

const normalizedTopics = repo => (repo.topics || []).map(topic => String(topic).toLowerCase());

/** A GitHub database ID survives repository renames, unlike its display name. */
export function stableProjectId(repo) {
  const identity = repo.repositoryId ?? repo.id ?? repo.node_id ?? repo.full_name ?? repo.name ?? "repository";
  return `project-${String(identity).toLowerCase().replace(/[^a-z0-9_-]+/g, "-")}`;
}

export function humanizeProjectName(name = "") {
  return name.replace(/[-_]+/g, " ").replace(/\b\w/g, character => character.toUpperCase()).trim();
}

/** Deterministic classification with manual overrides taking precedence. */
export function classifyProject(repo) {
  const topics = normalizedTopics(repo);
  const identity = String(repo.repositoryId ?? repo.id ?? "");
  const override = PROJECT_OVERRIDES[identity] || PROJECT_OVERRIDES[repo.name] || {};
  const hiddenByTopic = topics.some(topic => HIDDEN_TOPICS.includes(topic));
  const hidden = override.hidden ?? (hiddenByTopic || !!repo.disabled || (!!repo.archived && override.includeArchived !== true));
  const category = override.category || classifyByTopics(topics) || classifyByLanguage(repo.language || repo.primaryLanguage);
  const hasReadmeEvidence = Number(repo.readmeLength || repo.readme?.length || 0) >= 280;
  const explicitlyFeatured = topics.some(topic => FEATURED_TOPICS.includes(topic));
  const meaningfulSignals = [
    !!repo.description,
    !!repo.homepage,
    hasReadmeEvidence,
    Number(repo.stargazers_count || repo.stars || 0) >= 3,
  ].filter(Boolean).length;
  const featured = override.featured ?? (explicitlyFeatured || meaningfulSignals >= 3);
  const stars = Number(repo.stargazers_count || repo.stars || 0);
  return {
    featured,
    priority: override.priority ?? (explicitlyFeatured ? 20 : featured ? 40 - Math.min(20, stars) : 100),
    displayName: override.displayName || humanizeProjectName(repo.name),
    category,
    subcategory: override.subcategory || SUBCATEGORY_TOPICS.find(topic => topics.includes(topic)) || null,
    hidden,
  };
}

export function shouldHideRepo(repo) { return classifyProject(repo).hidden; }

function classifyByTopics(topics) {
  for (const { topic, category } of TOPIC_CATEGORIES) if (topics.includes(topic)) return category;
  return null;
}

function classifyByLanguage(language) {
  const value = String(language || "").toLowerCase();
  if (value === "python" || value === "jupyter notebook" || value === "r") return "data";
  if (["javascript", "typescript", "html", "css", "vue", "svelte"].includes(value)) return "web";
  return "archive";
}
