import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "./", // ✅ ensures assets are resolved from root
  plugins: [react()],
});
