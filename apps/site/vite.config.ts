import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/vite";
import path from "path";
import honoDevPlugin from "./vite/plugins/hono-dev-plugin";
import assetOptimizerPlugin from "./vite/plugins/asset-optimizer-plugin";

const root = path.resolve(__dirname, "../..");

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, root, "");
  Object.assign(process.env, env);

  return {
    // Env files live at the repo root — keep Vite's own env loading there too,
    // so apps/site/.env* files can never shadow the root .env.
    envDir: root,
    plugins: [honoDevPlugin(), react(), tailwind(), assetOptimizerPlugin()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src/web"),
      },
    },
    server: {
      port: Number(process.env.WEBSITE_PORT ?? 4200),
      strictPort: true,
      allowedHosts: true,
      hmr: { overlay: false },
      cors: false,
    },
  };
});
