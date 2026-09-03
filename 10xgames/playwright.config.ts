import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 4321',
    url: 'http://127.0.0.1:4321/10xdev3.0/',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  use: {
    baseURL: 'http://127.0.0.1:4321/10xdev3.0/',
    headless: true,
  },
});
