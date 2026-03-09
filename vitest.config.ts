import { resolve } from "node:path";
import { defineConfig } from "vitest/config";
import { WxtVitest } from "wxt/testing/vitest-plugin";

export default defineConfig(async () => ({
  plugins: await WxtVitest(),
  resolve: {
    alias: {
      "@/app": resolve(__dirname, "src/app"),
      "@/pages": resolve(__dirname, "src/pages"),
      "@/shared/ui": resolve(__dirname, "src/shared/ui"),
      "@/shared/lib": resolve(__dirname, "src/shared/lib"),
      "@/shared/hooks": resolve(__dirname, "src/shared/hooks"),
      "@": resolve(__dirname),
    },
  },
  test: {
    environment: "node",
    globals: false,
    setupFiles: ["./test/setup.ts"],
    include: ["**/*.test.ts", "**/*.test.tsx"],
  },
}));
