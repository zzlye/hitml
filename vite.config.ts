import { defineConfig } from "vite";

export default defineConfig({
  server: {
    proxy: {
      "/newapi/pricing": {
        target: "https://api.zzlye.xyz",
        changeOrigin: true,
        secure: true,
        rewrite: () => "/api/pricing"
      }
    }
  }
});
