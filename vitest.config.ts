import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    watch: true,
    typecheck: {
      include: ["src/**/*.test.ts"],
    },
    include: ["src/**/*.test.ts"],
  },
});
