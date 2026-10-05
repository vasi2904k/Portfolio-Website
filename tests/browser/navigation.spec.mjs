import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("https://api.github.com/**", route => route.fulfill({ status: 503, body: "Offline test fixture" }));
});

async function settled(page, id = "root") {
  await expect(page.locator(".neural-app")).toHaveAttribute("data-current-node", id);
  await expect(page.locator(".neural-app")).toHaveAttribute("data-navigation-phase", /CONTENT_VIEW|IDLE|HOVER/);
}
async function pose(page) { return page.locator(".neural-app").getAttribute("data-camera-position"); }
async function activate(page, id) { await page.locator('.neuron-label[data-neural-id="' + id + '"]').click(); await settled(page, id); }

test("3D branch activation, Back, breadcrumb and Root", async ({ page }) => {
  const errors = []; page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => { if (message.type() === "error" && /shader|hydration|did not match|WebGLProgram/i.test(message.text())) errors.push(message.text()); });
  await page.goto("/"); await settled(page);
  await expect(page.locator("canvas")).toBeVisible();
  await expect(page.locator(".fallback-notice")).toHaveCount(0);
  await activate(page, "skills"); await activate(page, "python");
  await expect(page.locator(".network-location")).toContainText("PYTHON");
  await page.getByRole("button", { name: "Back to Skills", exact: true }).click(); await settled(page, "skills");
  await page.locator(".network-location").getByRole("button", { name: "ROOT", exact: true }).click(); await settled(page);
  await expect(page.locator('.neuron-label[data-neural-id="pandas"]')).toHaveCount(0);
  await expect(page.locator("canvas")).toHaveAttribute("data-draw-calls", /\d+/);
  expect(Number(await page.locator("canvas").getAttribute("data-draw-calls"))).toBeLessThan(90);
  expect(errors).toEqual([]);
});

test("orbit, bounded zoom, and recenter preserve navigation", async ({ page, isMobile }) => {
  test.skip(isMobile, "Touch camera behavior has a dedicated gesture test.");
  await page.goto("/"); await settled(page);
  const initial = await pose(page);
  await page.getByRole("button", { name: "Pause ambient motion", exact: true }).click();
  await page.mouse.move(470, 250); await page.mouse.down(); await page.mouse.move(710, 330, { steps: 15 }); await page.mouse.up();
  await expect.poll(() => pose(page)).not.toBe(initial);
  await expect(page.locator(".neural-app")).toHaveAttribute("data-current-node", "root");
  const rotated = await pose(page);
  await page.mouse.wheel(0, -340);
  await expect.poll(() => pose(page)).not.toBe(rotated);
  await page.getByRole("button", { name: "◎ RECENTER", exact: true }).click(); await settled(page);
  await expect.poll(() => pose(page)).toBe(initial);
});

test("keyboard focus and unified wheel travel", async ({ page, isMobile }) => {
  test.skip(isMobile, "Desktop keyboard and wheel routing.");
  await page.goto("/"); await settled(page);
  await page.locator(".neural-app").focus(); await page.keyboard.press("ArrowRight");
  await expect(page.locator(".neural-app")).toHaveAttribute("data-current-node", "root");
  await page.keyboard.press("Enter"); await settled(page, "about");
  await page.keyboard.press("Escape"); await settled(page);
  await page.mouse.move(470, 240); await page.mouse.wheel(0, 220); await settled(page, "about");
  await page.keyboard.press("Escape"); await settled(page);
  // Generate a continuous burst in the page. Protocol round trips between
  // native wheel calls can exceed the quiet-gap threshold on software GPUs.
  await page.evaluate(async () => {
    const viewport = document.querySelector(".network-viewport");
    for (let i = 0; i < 85; i++) {
      viewport.dispatchEvent(new WheelEvent("wheel", { deltaY: 120, bubbles: true, cancelable: true }));
      await new Promise(resolve => setTimeout(resolve, 40));
    }
  });
  await settled(page, "about");
});

test("double activation focuses once and Recenter can interrupt a transition", async ({ page, isMobile }) => {
  await page.goto("/"); await settled(page);
  const node = page.locator('.neuron-label[data-neural-id="skills"]');
  if (isMobile) { const box = await node.boundingBox(); await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2); await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2); }
  else await node.dblclick({ delay: 60 });
  await expect(page.locator(".neural-app")).toHaveAttribute("data-current-node", "skills");
  await page.getByRole("button", { name: "◎ RECENTER", exact: true }).click();
  await settled(page, "skills");
  await expect(page.locator('.neuron-label[data-neural-id="python"]')).toBeEnabled();
  await page.getByRole("button", { name: "Return to root", exact: true }).first().click(); await settled(page);
});

test("reduced motion, theme switching and accessible map keep navigation available", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/"); await settled(page);
  await expect(page.locator(".neural-app")).toHaveAttribute("data-theme", "blue");
  await page.getByRole("button", { name: /Switch to neural green/ }).click();
  await expect(page.locator(".neural-app")).toHaveAttribute("data-theme", "green");
  await page.getByRole("button", { name: /Switch to neon blue/ }).click();
  await expect(page.locator(".neural-app")).toHaveAttribute("data-theme", "blue");
  await page.locator(".map-toggle").click();
  const map = page.getByRole("dialog", { name: /Network overview/ });
  await expect(map).toBeVisible();
  await map.getByRole("button", { name: "Skills", exact: true }).click();
  await settled(page, "skills");
  await expect(map).toHaveCount(0);
  await activate(page, "python");
  await expect(page.locator(".neural-app")).toHaveAttribute("data-navigation-depth", "2");
});

test("Back restores the actual prior location and Root clears history", async ({ page }) => {
  await page.goto("/"); await settled(page);
  await activate(page, "skills"); await activate(page, "python");
  await page.locator(".network-location").getByRole("button", { name: "ROOT", exact: true }).click(); await settled(page);
  await expect(page.locator(".neural-app")).toHaveAttribute("data-navigation-history", /python,root$/);
  await page.getByRole("button", { name: "Back to Python & data", exact: true }).click(); await settled(page, "python");
  await page.getByRole("button", { name: "Return to root", exact: true }).first().click(); await settled(page);
  await expect(page.locator(".neural-app")).toHaveAttribute("data-navigation-history", "root");
});

test("first-visit hint retires after interaction and recruiter view is a usable escape hatch", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.removeItem("neural-onboarding-seen-v2"));
  await page.reload(); await settled(page);
  await expect(page.locator(".scene-instructions")).not.toHaveClass(/instructions-learned/);
  await page.getByRole("button", { name: "About & work" }).click();
  const recruiter = page.getByRole("dialog", { name: "Recruiter overview" });
  await expect(recruiter).toBeVisible();
  await expect(recruiter.getByRole("link", { name: "Download resume" })).toHaveAttribute("href", "/mohammed-vasi-khan-resume.pdf");
  await page.getByRole("button", { name: "View experience", exact: true }).click(); await settled(page, "journey");
  await expect(page.getByRole("dialog", { name: "Recruiter overview" })).toHaveCount(0);
  await page.reload(); await settled(page);
  await expect(page.locator(".scene-instructions")).toHaveClass(/instructions-learned/);
});

test("a fresh GitHub repository joins the static deployment without a rebuild", async ({ page }) => {
  await page.unroute("https://api.github.com/**");
  await page.route("https://api.github.com/**", route => {
    const url = route.request().url();
    if (url.includes("/users/vasi2904k/repos")) return route.fulfill({
      contentType: "application/json",
      body: JSON.stringify([{ id: 777, name: "live-rag-agent", full_name: "vasi2904k/live-rag-agent", html_url: "https://github.com/vasi2904k/live-rag-agent", description: "A grounded document assistant", language: "Python", topics: ["llm", "rag", "portfolio-project"], updated_at: "2026-09-10T00:00:00Z" }]),
    });
    if (url.endsWith("/readme")) return route.fulfill({ body: "## Overview\nA grounded document assistant.\n\n## Tech Stack\n- Python\n- Retrieval" });
    if (url.endsWith("/languages")) return route.fulfill({ contentType: "application/json", body: JSON.stringify({ Python: 1200 }) });
    return route.fulfill({ status: 404 });
  });
  await page.goto("/"); await settled(page);
  await expect(page.locator(".neural-app")).toHaveAttribute("data-project-sync", "live");
  await expect(page.locator(".neural-app")).toHaveAttribute("data-project-count", "1");
  await activate(page, "projects");
  await activate(page, "projects-featured");
  await expect(page.locator('.neuron-label[data-neural-id="project-777"]')).toBeVisible();
});

test("WebGL context loss retains branch selection and Back", async ({ page }) => {
  await page.goto("/"); await settled(page);
  await page.locator("canvas").evaluate(canvas => canvas.dispatchEvent(new Event("webglcontextlost", { cancelable: true })));
  await expect(page.locator(".fallback-notice")).toBeVisible();
  await page.locator('.fallback-neuron[data-neural-id="skills"]').click(); await settled(page, "skills");
  await page.getByRole("button", { name: /^Back to/ }).click(); await settled(page);
});

test("native touch orbit, pinch, two-finger pan, and vertical pathway travel", async ({ page, context }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-chrome", "Native multi-touch injection uses Chromium's input protocol; physical iOS testing remains separate.");
  await page.goto("/"); await settled(page);
  const session = await context.newCDPSession(page);
  async function gesture(from, to) {
    const points = list => list.map(([x, y], id) => ({ x, y, id, radiusX: 6, radiusY: 6 }));
    await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: points(from) });
    for (let step = 1; step <= 8; step++) {
      await session.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: points(from.map((p, i) => p.map((v, axis) => v + (to[i][axis] - v) * step / 8))) });
      await page.waitForTimeout(18);
    }
    await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  }
  const initial = await pose(page);
  await gesture([[80, 200]], [[210, 240]]);
  await expect.poll(() => pose(page)).not.toBe(initial);
  await expect(page.locator(".neural-app")).toHaveAttribute("data-current-node", "root");
  await page.getByRole("button", { name: "◎ RECENTER", exact: true }).click(); await settled(page);
  const beforePinch = await pose(page);
  await gesture([[135, 220], [235, 220]], [[75, 220], [295, 220]]);
  await expect.poll(() => pose(page)).not.toBe(beforePinch);
  const target = await page.locator(".neural-app").getAttribute("data-camera-target");
  await gesture([[140, 220], [240, 220]], [[170, 255], [270, 255]]);
  await expect.poll(() => page.locator(".neural-app").getAttribute("data-camera-target")).not.toBe(target);
  const panned = (await page.locator(".neural-app").getAttribute("data-camera-target")).split(",").map(Number);
  expect(Math.hypot(...panned)).toBeLessThanOrEqual(2.001);
  await page.getByRole("button", { name: "◎ RECENTER", exact: true }).click(); await settled(page);
  await gesture([[40, 420]], [[42, 300]]); await settled(page, "about");
  await gesture([[40, 260]], [[42, 390]]); await settled(page);
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  expect(await page.evaluate(() => window.visualViewport.scale)).toBeCloseTo(1, 2);
  await session.detach();
});
export { settled, pose };

test('human portfolio exposes identity, anchored skills, and resume alongside the neural homepage', async ({ page }) => {
  await page.goto('/'); await settled(page);
  await page.getByRole('button', { name: 'About & work' }).click();
  const overview = page.getByRole('dialog', { name: 'Recruiter overview' });
  await expect(overview.getByRole('heading', { name: 'Mohammed Vasi Khan', exact: true })).toBeVisible();
  await expect(overview.getByRole('link', { name: 'Download resume', exact: true })).toHaveAttribute('href', '/mohammed-vasi-khan-resume.pdf');
  await overview.getByRole('link', { name: 'Skills', exact: true }).click();
  await expect(overview.getByRole('heading', { name: 'Technical toolkit', exact: true })).toBeInViewport();
  await overview.getByRole('button', { name: 'Return to neural network' }).click();
  await expect(overview).toHaveCount(0);
  await expect(page.locator('canvas')).toBeVisible();
});

test('plain-language entry point opens a photo-free personal portfolio', async ({ page, isMobile }) => {
  await page.goto('/'); await settled(page);
  if (isMobile) await page.getByRole('button', { name: 'Read introduction' }).click();
  await expect(page.locator('.output-summary')).toContainText('machine learning engineer');
  await expect(page.locator('.output-top')).toContainText('Introduction');
  await page.getByRole('button', { name: 'About & work', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Recruiter overview' })).toBeVisible();
  await expect(page.locator('.portfolio-photo')).toHaveCount(0);
});
