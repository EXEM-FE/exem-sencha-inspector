import { defineConfig } from "vitest/config";
import { WxtVitest } from "wxt/testing/vitest-plugin";

export default defineConfig(async () => ({
  plugins: await WxtVitest(),
  test: {
    environment: "node",
    globals: false,
    setupFiles: ["./test/setup.ts"],
    include: ["**/*.test.ts", "**/*.test.tsx"],
  },
}));
