import { sveltekit } from '@sveltejs/kit/vite';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import devtoolsJson from 'vite-plugin-devtools-json';

const _dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('vite').UserConfig} */
const config = {
  plugins: [sveltekit(), devtoolsJson()],
  server: {
    fs: {
      allow: [
        // Default allowed directories
        'src',
        'node_modules',
        '.svelte-kit',
        // Add the static directory
        'static',
      ],
    },
  },
};

export default config;
