import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Dev server tuned for the Arena live-preview proxy host (*.e2b.app).
// bind to 0.0.0.0 + allow any host so the proxied preview origin works.
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    allowedHosts: [".e2b.app", "localhost", "127.0.0.1"],
    cors: true,
  },
  preview: {
    host: "0.0.0.0",
    port: 4173,
    allowedHosts: [".e2b.app", "localhost", "127.0.0.1"],
  },
  build: {
    target: "es2020",
    outDir: "dist",
  },
});
