import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    {
      name: "index-html-build-replacement",
      apply: "build",
      transformIndexHtml(html) {
        return (
          html
            // .replace(/<title>(.*?)<\/title>/, `<title>SMERGE (BETA)</title>`)
            .replace(/<title>(.*?)<\/title>/, `<title>SMERGE</title>`)
            .replace(/_dev.svg/, `.svg`)
            .replace(/_dev.png/, `.png`)
            .replace(/_dev.webmanifest/, `.webmanifest`)
        );
      },
    },
    react(),
    tsconfigPaths(),
  ],
  base: "/ext/",
  server: {
    port: 5069,
    strictPort: true,
  },
  preview: {
    port: 5069,
  },
  define: {
    __BUILD_HASH__: JSON.stringify(
      [...Array(8)].map(() => Math.random().toString(16)[2]).join("")
    ),
  },
});
