import { sveltekit } from "@sveltejs/kit/vite";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('vite').UserConfig} */
const config = {
  plugins: [sveltekit()],
  server: {
    fs: {
      allow: [
        // Default allowed directories
        "src",
        "node_modules",
        ".svelte-kit",
        // Add the static directory
        "static",
      ],
    },
  },
};

export default config;
