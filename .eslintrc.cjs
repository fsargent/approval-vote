module.exports = {
  extends: [
    // add more generic rule sets here, such as:
    // 'eslint:recommended',
    "plugin:svelte/prettier",
  ],
  // ignorePatterns: ["tsconfig.json"],
  rules: {
    // override/add rules settings here, such as:
    // 'svelte/rule-name': 'error'
  },
  parser: "@typescript-eslint/parser",
  overrides: [
    {
      files: ["*.svelte"],
      parser: "svelte-eslint-parser",
      // Parse the `<script>` in `.svelte` as TypeScript by adding the following configuration.
      parserOptions: {
        parser: "@typescript-eslint/parser",
      },
    },
  ],
};
