import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  retries: 0,
  use: {
    baseURL: process.env.E2E_URL ?? 'https://peru-ruta-del-poder.pages.dev',
    viewport: { width: 1440, height: 900 },
    headless: true,
    screenshot: 'only-on-failure',
  },
  reporter: [['list']],
});
