import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: "jsdom",
    // https://vitest.dev/config/#coverage
    coverage: {
      provider: "v8",
      reporter: ["html"],
      include: ["js/**/*.js"],
    },
  },
});
