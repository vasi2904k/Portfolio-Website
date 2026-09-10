import { classifyProject, stableProjectId } from "@/utils/projectClassifier.mjs";
import { createProjectRecord } from "@/utils/readmeProject.mjs";

export function prepareProjects(repositories = []) {
  const unique = new Map();
  for (const repo of repositories) {
    if (!repo || repo.private || repo.fork) continue;
    const classification = classifyProject({ ...repo, readmeLength: repo.readme?.length || repo.readmeLength || 0 });
    const project = createProjectRecord({ ...repo, classification });
    unique.set(stableProjectId(project), project);
  }
  return [...unique.values()].sort((a, b) => a.priority - b.priority || new Date(b.updated_at || 0) - new Date(a.updated_at || 0));
}

export function mergeProjectSnapshots(repositories, previousProjects = []) {
  const previous = new Map(previousProjects.map(project => [stableProjectId(project), project]));
  return prepareProjects(repositories).map(project => {
    const prior = previous.get(stableProjectId(project));
    if (!prior || project.syncEnriched) return project;
    return {
      ...prior,
      ...project,
      problem: prior.problem,
      solution: prior.solution,
      architecture: prior.architecture,
      metrics: prior.metrics || [],
      highlights: prior.highlights || [],
      technologies: [...new Set([...(project.technologies || []), ...(prior.technologies || [])])].slice(0, 10),
      readmeAvailable: prior.readmeAvailable,
      readmeLength: prior.readmeLength,
    };
  });
}
