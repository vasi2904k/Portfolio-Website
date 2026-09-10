"use client";
import { useEffect, useState } from "react";
import { GITHUB_SYNC } from "@/config/config";
import { fetchLivePortfolioProjects } from "@/utils/liveProjectSync.mjs";

const CACHE_KEY = "neural-live-projects-v1";

export default function useLiveProjects(initialProjects) {
  const [snapshot, setSnapshot] = useState(null);
  const [status, setStatus] = useState("snapshot");

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 18000);
    try {
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
      if (cached?.expiresAt > Date.now() && Array.isArray(cached.projects)) {
        setSnapshot(cached.projects);
        setStatus("live-cache");
        clearTimeout(timeout);
        return () => { active = false; controller.abort(); };
      }
    } catch {}

    setStatus("refreshing");
    fetchLivePortfolioProjects(initialProjects, { signal: controller.signal })
      .then(projects => {
        if (!active || !projects.length) return;
        setSnapshot(projects);
        setStatus("live");
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({
            expiresAt: Date.now() + GITHUB_SYNC.revalidateSeconds * 1000,
            projects,
          }));
        } catch {}
      })
      .catch(() => { if (active) setStatus("snapshot"); })
      .finally(() => clearTimeout(timeout));

    return () => { active = false; clearTimeout(timeout); controller.abort(); };
  }, [initialProjects]);

  return { snapshot, status };
}
