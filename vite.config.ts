import tsconfigPaths from "vite-tsconfig-paths";
import react from "@vitejs/plugin-react";

import { defineConfig, loadEnv } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the
  // `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')
  return {
    // vite config
    plugins: [react(), tsconfigPaths(), nodePolyfills()],
    define: {
      __APP_COMMIT__: JSON.stringify(env.VERCEL_GIT_COMMIT_SHA),
    },
  }
})