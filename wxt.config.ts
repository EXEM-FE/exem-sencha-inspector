import { defineConfig } from "wxt";

export default defineConfig({
  modules: ["@wxt-dev/module-react"],
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
