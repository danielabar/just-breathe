import { defineConfig } from 'vitest/config';

// Exclude tests/ to prevent Vitest from picking up Playwright specs (tests/visual/).
// Unit tests live in js/, e2e tests are run separately via `npm run test:e2e`.
export default defineConfig({
  test: {
    environment: "jsdom",
    exclude: ["tests/**", "node_modules/**"],
    // https://vitest.dev/config/#coverage
    coverage: {
      provider: "v8",
      reporter: ["html"],
      include: ["js/**/*.js"],
    },
  },
});
