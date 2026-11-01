import { defineConfig } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
process.env.COMMERCE_SETTINGS_PROOF_RUN ??= Date.now().toString();
const directory = resolve(".tmp/settings-ci", process.env.COMMERCE_SETTINGS_PROOF_RUN);
mkdirSync(directory, { recursive: true });
const port = Number(process.env.COMMERCE_SETTINGS_PROOF_PORT ?? 64635);
process.env.COMMERCE_SETTINGS_ARTIFACTS = directory;
export default defineConfig({
  testDir: "./sandbox", testMatch: "merchant-settings.spec.mjs", timeout: 180000,
  workers: 1, reporter: [["list"], ["./settings-evidence-reporter.mjs"]], outputDir: directory + "/test-results",
  projects: [
    { name: "registry", use: { baseURL: "http://127.0.0.1:" + port, screenshot: "off", trace: "off", video: "off", viewport: { width: 1440, height: 1100 } } },
  ],
  webServer: [{
    command: "../../node_modules/.bin/astro dev --host 127.0.0.1 --port " + port,
    cwd: resolve("tests/sandbox-site"), url: "http://127.0.0.1:" + port, reuseExistingServer: false,
    timeout: 120000, env: { ASTRO_DEV_BACKGROUND: "1", COMMERCE_PROOF_DB: "file:" + directory + "/sandbox-site.db",
      EMDASH_SITE_URL: "http://127.0.0.1:" + port, COMMERCE_SITE_URL: "http://127.0.0.1:" + port,
      NO_PROXY: "127.0.0.1,localhost,::1", no_proxy: "127.0.0.1,localhost,::1" },
  }],
});
