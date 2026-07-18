// Temporary compatibility wrapper while the project is detached from Lovable Cloud.
// A later build-tested change will replace this with the standard TanStack Start config.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    server: { entry: "server" },
  },
});
