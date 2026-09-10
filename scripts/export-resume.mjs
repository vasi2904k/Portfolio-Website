import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";

const root = process.cwd();
const outputDirectory = path.join(root, "output", "pdf");
const previewDirectory = path.join(root, "tmp", "pdfs");
const output = path.join(outputDirectory, "Mohammed-Vasi-Khan-Resume.pdf");
const publicCopy = path.join(root, "public", "mohammed-vasi-khan-resume.pdf");
await Promise.all([mkdir(outputDirectory, { recursive: true }), mkdir(previewDirectory, { recursive: true })]);

const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 794, height: 1123 }, deviceScaleFactor: 1.5 });
  await page.goto(process.env.RESUME_URL || "http://127.0.0.1:3000/resume", { waitUntil: "networkidle" });
  await page.emulateMedia({ media: "print" });
  await page.pdf({ path: output, printBackground: true, preferCSSPageSize: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
  await page.screenshot({ path: path.join(previewDirectory, "resume-page.png"), fullPage: true });
  await copyFile(output, publicCopy);
  console.log(output);
} finally {
  await browser.close();
}
