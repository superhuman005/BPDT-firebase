import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig({
  plugins: [
    react(),
    componentTagger()
  ],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      // prevents Vite from loading native Rollup binaries
      plugins: [],
    },
  },
});
