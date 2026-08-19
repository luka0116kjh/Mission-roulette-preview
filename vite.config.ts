import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base: "./" — GitHub Pages / Vercel 어디에 올려도 상대 경로로 동작한다.
export default defineConfig({
  plugins: [react()],
  base: "./",
});
