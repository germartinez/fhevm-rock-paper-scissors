import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "happy-dom",
    globals: true,
    include: ["test/**/*.test.ts"],
    testTimeout: 300_000,
    maxConcurrency: 1,
  },
});
