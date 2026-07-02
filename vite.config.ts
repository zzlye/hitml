import { defineConfig } from "vite";

export default defineConfig({
  server: {
    proxy: {
      "/newapi/pricing": {
        target: "https://zzlye.xyz:60",
        changeOrigin: true,
        secure: true,
        rewrite: () => "/api/pricing"
      }
    }
  }
});
