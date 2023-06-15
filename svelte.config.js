/** @type {import('@sveltejs/kit').Config} */
import adapter from "@sveltejs/adapter-static";
import preprocess from "svelte-preprocess";

const config = {
  // options passed to svelte.compile (https://svelte.dev/docs#compile-time-svelte-compile)
  compilerOptions: {},

  // an array of file extensions that should be treated as Svelte components
  extensions: [".svelte"],

  kit: {
    adapter: adapter(),
    prerender: {
      handleHttpError: ({ error, request }) => {
        console.log(`HTTP error during prerendering: ${error}`);
        console.log(`Request that caused the error: ${request}`);
        return { status: 500 };
      },
    },
    alias: {},
    appDir: "_app",
    csp: {
      mode: "auto",
      directives: {
        "default-src": undefined,
        // ...
      },
    },
    csrf: {
      checkOrigin: true,
    },
    env: {
      dir: process.cwd(),
      publicPrefix: "PUBLIC_",
    },
    files: {
      assets: "static",
      hooks: {
        client: "src/hooks.client",
        server: "src/hooks.server",
      },
      lib: "src/lib",
      params: "src/params",
      routes: "src/routes",
      appTemplate: "src/app.html",
      errorTemplate: "src/error.html",
    },
    inlineStyleThreshold: 0,
    moduleExtensions: [".js", ".ts"],
    outDir: ".svelte-kit",
    paths: {
      assets: "",
      base: "",
    },
    serviceWorker: {
      register: false,
      files: (filepath) => !/\.DS_Store/.test(filepath),
    },
    version: {
      name: Date.now().toString(),
      pollInterval: 0,
    },
  },

  // options passed to @sveltejs/package
  package: {
    source: "value of kit.files.lib, if available, else src/lib",
    dir: "package",
    emitTypes: true,
    // excludes all .d.ts and files starting with _ as the name
    exports: (filepath) => !/^_|\/_|\.d\.ts$/.test(filepath),
    files: () => true,
  },

  // options passed to svelte.preprocess (https://svelte.dev/docs#compile-time-svelte-preprocess)
  preprocess: preprocess(),
};

export default config;
