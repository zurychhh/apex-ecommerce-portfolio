import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";

// Use PORT env variable from Shopify CLI, fallback to 3000
const port = parseInt(process.env.PORT || "3000", 10);

export default defineConfig({
  plugins: [
    remix({
      ignoredRouteFiles: ["**/.*"],
      appDirectory: "app",
      serverBuildFile: "index.js",
    }),
  ],
  server: {
    port,
    hmr: {
      protocol: "ws",
      host: "localhost",
      port,
    },
  },
});
