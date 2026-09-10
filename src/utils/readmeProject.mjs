const SECTION_ALIASES = {
  overview: ["overview", "about", "summary", "introduction", "project overview"],
  problem: ["problem", "problem statement", "challenge", "motivation"],
  solution: ["solution", "approach", "methodology", "method", "implementation"],
  architecture: ["architecture", "system architecture", "pipeline", "workflow", "design"],
  technologies: ["tech stack", "technology", "technologies", "tools", "built with"],
  results: ["results", "evaluation", "metrics", "performance", "outcomes"],
  highlights: ["highlights", "features", "key features", "capabilities"],
  demo: ["demo", "live demo", "deployment"],
};

const normalizeHeading = value => value.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();

function plainText(value = "") {
  return value
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<!--([\s\S]*?)-->/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+[.)]\s+/gm, "")
    .replace(/[*_`>#|~]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function clipped(value, maximum = 560) {
  const content = plainText(value);
  if (content.length <= maximum) return content;
  return `${content.slice(0, maximum).replace(/\s+\S*$/, "")}…`;
}

function listItems(value = "", limit = 6) {
  const lines = value.split(/\r?\n/)
    .filter(line => /^\s*(?:[-*+] |\d+[.)] )/.test(line))
    .map(line => clipped(line.replace(/^\s*(?:[-*+] |\d+[.)] )/, ""), 180))
    .filter(Boolean);
  if (lines.length) return [...new Set(lines)].slice(0, limit);
  const content = clipped(value, 700);
  return content ? content.split(/(?<=[.!?])\s+/).filter(Boolean).slice(0, Math.min(limit, 3)) : [];
}

export function parseProjectReadme(readme = "") {
  if (!readme.trim()) return {};
  const sections = new Map();
  let current = "overview";
  for (const line of readme.split(/\r?\n/)) {
    const match = line.match(/^#{1,4}\s+(.+?)\s*#*$/);
    if (match) {
      const heading = normalizeHeading(match[1]);
      current = Object.entries(SECTION_ALIASES).find(([, aliases]) => aliases.includes(heading))?.[0] || `ignored:${heading}`;
      continue;
    }
    if (!current.startsWith("ignored:")) sections.set(current, `${sections.get(current) || ""}\n${line}`);
  }
  const overview = clipped(sections.get("overview"), 520);
  const technologies = listItems(sections.get("technologies"), 10);
  const results = listItems(sections.get("results"), 6);
  const highlights = listItems(sections.get("highlights"), 6);
  return {
    ...(overview ? { overview } : {}),
    ...(sections.get("problem") ? { problem: clipped(sections.get("problem")) } : {}),
    ...(sections.get("solution") ? { solution: clipped(sections.get("solution")) } : {}),
    ...(sections.get("architecture") ? { architecture: clipped(sections.get("architecture"), 700) } : {}),
    ...(technologies.length ? { technologies } : {}),
    ...(results.length ? { metrics: results } : {}),
    ...(highlights.length ? { highlights } : {}),
    ...(sections.get("demo") ? { demoNotes: clipped(sections.get("demo"), 280) } : {}),
  };
}

export function createProjectRecord(repo) {
  const parsed = parseProjectReadme(repo.readme || "");
  const classification = repo.classification || {};
  const languageNames = Object.keys(repo.languages || {});
  const technologies = [...new Set([
    ...(parsed.technologies || []), ...languageNames, repo.language || repo.primaryLanguage,
  ].filter(Boolean))].slice(0, 10);
  const tags = [...new Set([...(repo.topics || []), ...technologies])].slice(0, 10);
  const identity = repo.repositoryId ?? repo.id ?? repo.node_id ?? repo.full_name ?? repo.name ?? "repository";
  return {
    ...repo,
    projectId: `project-${String(identity).toLowerCase().replace(/[^a-z0-9_-]+/g, "-")}`,
    repositoryId: String(identity),
    title: classification.displayName || repo.displayName || repo.name?.replace(/[-_]+/g, " ") || "Repository",
    category: classification.category || "archive",
    subcategory: classification.subcategory || null,
    summary: repo.description || parsed.overview || `Explore ${repo.name || "this repository"} and its implementation.`,
    problem: parsed.problem,
    solution: parsed.solution,
    architecture: parsed.architecture,
    technologies,
    metrics: parsed.metrics || [],
    highlights: parsed.highlights || [],
    github: repo.html_url,
    demo: /^https?:\/\//.test(repo.homepage || "") ? repo.homepage : null,
    tags,
    featured: classification.featured ?? false,
    priority: classification.priority ?? 100,
    hidden: classification.hidden ?? false,
    readmeAvailable: !!repo.readme,
    readmeLength: repo.readme?.length || 0,
    readme: undefined,
  };
}
