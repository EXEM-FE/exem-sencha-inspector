import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "wxt";

const rootDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  vite: () => ({
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "@/app": resolve(rootDir, "src/app"),
        "@/pages": resolve(rootDir, "src/pages"),
        "@/shared/ui": resolve(rootDir, "src/shared/ui"),
        "@/shared/lib": resolve(rootDir, "src/shared/lib"),
        "@/shared/hooks": resolve(rootDir, "src/shared/hooks"),
        "@": rootDir,
      },
    },
  }),
  manifest: {
    name: "Exem Sencha Inspector",
    description: "DevTools extension scaffold for Sencha runtime inspection.",
    host_permissions: ["<all_urls>"],
    web_accessible_resources: [
      {
        resources: ["injected.js"],
        matches: ["<all_urls>"],
      },
    ],
  },
});
