// tsup.config.ts
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs", "iife"], 
  dts: true,
  clean: true,
  minify: true, // Add minification
  treeshake: true, // Remove unused code
  splitting: false, // Single bundle
  sourcemap: false, // Remove source maps for production
  globalName: "NotifierLib",
  target: "es2020",
});