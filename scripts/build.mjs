import { mkdir, rm, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";

const root = process.cwd();
const nextCli = path.join(root, "node_modules", "next", "dist", "bin", "next");
const baseEnvironment = { ...process.env, NEXT_TELEMETRY_DISABLED: "1" };
delete baseEnvironment.NEXT_STATIC_EXPORT;

function build(environment) {
  const result = spawnSync(process.execPath, [nextCli, "build"], {
    cwd: root,
    env: environment,
    stdio: "inherit",
  });
  if (result.status !== 0) process.exit(result.status || 1);
}

// Keep the ordinary Next output for full server deployments and hourly ISR.
build({ ...baseEnvironment, NEXT_DIST_DIR: ".next" });

// Sites consumes a Cloudflare Worker plus a static publication snapshot.
await rm(path.join(root, "dist"), { recursive: true, force: true });
build({ ...baseEnvironment, NEXT_DIST_DIR: "dist", NEXT_STATIC_EXPORT: "1" });

const serverDirectory = path.join(root, "dist", "server");
await mkdir(serverDirectory, { recursive: true });
await writeFile(path.join(serverDirectory, "index.js"), `export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);
    if (response.status !== 404 || request.method !== "GET") return response;
    const url = new URL(request.url);
    if (url.pathname.split("/").at(-1)?.includes(".")) return response;
    url.pathname = "/index.html";
    return env.ASSETS.fetch(new Request(url, request));
  },
};
`);
