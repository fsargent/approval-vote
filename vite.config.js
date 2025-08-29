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
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Split Mermaid into its own chunk since it's only used on one page
          if (id.includes('mermaid')) {
            return 'mermaid';
          }
          // Split vendor deps into separate chunk
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
  },
};

export default config;
