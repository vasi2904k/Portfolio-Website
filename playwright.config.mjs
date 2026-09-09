import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/browser", timeout: 60000, expect: { timeout: 18000 }, workers: 1,
  use: { baseURL: "http://localhost:3000", screenshot: "only-on-failure", trace: "retain-on-failure" },
  webServer: { command: "npm run dev", url: "http://localhost:3000", reuseExistingServer: true, timeout: 120000 },
  projects: [
    { name: "chrome", use: { browserName: "chromium", channel: "chrome", viewport: { width: 1440, height: 900 }, launchOptions: { args: ["--enable-unsafe-swiftshader"] } } },
    { name: "firefox", use: { browserName: "firefox", viewport: { width: 1440, height: 900 } } },
    { name: "mobile-chrome", use: { ...devices["Pixel 7"], deviceScaleFactor: 1, browserName: "chromium", channel: "chrome", launchOptions: { args: ["--enable-unsafe-swiftshader"] } } },
    { name: "mobile-webkit", use: { ...devices["iPhone 13"], deviceScaleFactor: 1, browserName: "webkit" } },
  ],
});
