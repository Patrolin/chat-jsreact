import { defineConfig, UserConfig } from "vite";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(() => {
  const config: UserConfig = {
    envPrefix: ["VITE_", "JSREACT_"],
    resolve: { alias: [
      { find: "@", replacement: path.resolve(__dirname, "src") },
      { find: "react", replacement: path.resolve(__dirname, "src/jsreact") },
      { find: "react-dom", replacement: path.resolve(__dirname, "src/jsreact/react-dom") },
      { find: "preact", replacement: path.resolve(__dirname, "src/jsreact/preact") },
      { find: "preact-iso", replacement: path.resolve(__dirname, "src/jsreact/preact-iso") },
    ] },
    server: { port: 3000, strictPort: true },
  };
  return config;
});
