import path from "path";
import { defineConfig, UserConfig } from "vite";
import tailwindcss from '@tailwindcss/vite'

const USE_PROXY = process.env.NODE_ENV === "development";

// https://vitejs.dev/config/
export default defineConfig(() => {
  const config: UserConfig = {
    envPrefix: ["VITE_", "JSREACT_", "CHAT_"],
    resolve: { alias: [
      { find: "@", replacement: path.resolve(__dirname, "src") },
      { find: "react", replacement: path.resolve(__dirname, "src/jsreact") },
      { find: "react-dom", replacement: path.resolve(__dirname, "src/jsreact/react-dom") },
      { find: "preact", replacement: path.resolve(__dirname, "src/jsreact/preact") },
      { find: "preact-iso", replacement: path.resolve(__dirname, "src/jsreact/preact-iso") },
    ] },
    plugins: [tailwindcss()],
    server: {
      port: 3000,
      strictPort: true,
      proxy: USE_PROXY ? {
        "/api": {
          target: "http://localhost:8080",
          changeOrigin: true,
          secure: false,
        },
      } : undefined,
    },
  };
  return config;
});
