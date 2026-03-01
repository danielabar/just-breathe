import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/visual',
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:8080',
    viewport: { width: 375, height: 812 },
    toHaveScreenshot: { maxDiffPixels: 10 },
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:8080',
    reuseExistingServer: true,
  },
});
