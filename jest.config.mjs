/**
 * Jest configuration for Just Breathe - frontend-only ESM project
 * Uses JSDOM for simulating the browser environment
 * Uses V8 for code coverage instrumentation (faster with native ESM)
 */

export default {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  testEnvironment: "jsdom",

  // You can enable this if you're mocking ES modules that import JSON or CSS
  transform: {}
};
