import js from '@eslint/js';
import ts from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import svelte from 'eslint-plugin-svelte';
import svelteParser from 'svelte-eslint-parser';

export default [
  // Base JavaScript/TypeScript configuration
  js.configs.recommended,

  // Node.js scripts configuration
  {
    files: ['scripts/**/*.js', 'scripts/**/*.mjs', 'svelte.config.js', 'vite.config.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        // Node.js globals
        console: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        Buffer: 'readonly',
        global: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
        // Modern Node.js globals
        fetch: 'readonly',
        Response: 'readonly',
        Request: 'readonly',
      },
    },
    rules: {
      'no-console': 'off', // Allow console.log in Node.js scripts
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
        },
      ],
    },
  },

  // TypeScript configuration for all .ts files
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': ts,
    },
    rules: {
      ...ts.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
        },
      ],
    },
  },

  // Server-specific overrides (Node.js environment)
  {
    files: ['src/**/*.server.ts', 'src/**/+*.server.ts', 'src/**/+server.ts'],
    languageOptions: {
      globals: {
        console: 'readonly',
        process: 'readonly',
        fetch: 'readonly',
        Response: 'readonly',
        Request: 'readonly',
      },
    },
    rules: {
      'no-console': 'off', // Allow console.log in server files
    },
  },

  // Svelte configuration
  ...svelte.configs['flat/recommended'],

  // TypeScript + Svelte configuration for .svelte files
  {
    files: ['**/*.svelte'],
    languageOptions: {
      parser: svelteParser,
      parserOptions: {
        parser: tsParser,
        ecmaVersion: 2022,
        sourceType: 'module',
      },
      globals: {
        // Browser globals for client-side Svelte
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        fetch: 'readonly',
        // Allow some common globals that might be used
        console: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': ts,
    },
    rules: {
      // SvelteKit specific rules
      'svelte/no-export-load-in-svelte-module-in-kit-pages': 'error',
      'svelte/valid-prop-names-in-kit-pages': 'error',
      'svelte/no-navigation-without-base': 'warn',

      // Styling rules (more lenient for large existing files)
      'svelte/html-quotes': ['warn', { prefer: 'double' }],
      'svelte/indent': 'off', // Too noisy for existing code
      'svelte/max-attributes-per-line': 'off', // Too noisy for existing code
      'svelte/mustache-spacing': 'warn',
      'svelte/no-spaces-around-equal-signs-in-attribute': 'warn',
      'svelte/shorthand-attribute': 'warn',
      'svelte/shorthand-directive': 'warn',
      'svelte/sort-attributes': 'off', // Too noisy for existing code

      // Best practices
      'svelte/no-unused-svelte-ignore': 'error',
      'svelte/no-useless-mustaches': 'warn',
      'svelte/prefer-class-directive': 'warn',
      'svelte/prefer-style-directive': 'warn',
      'svelte/require-store-callbacks-use-set-param': 'error',
      'svelte/require-store-reactive-access': 'error',
      'svelte/require-each-key': 'warn', // Warn instead of error
      'svelte/no-at-html-tags': 'warn', // Warn instead of error

      // Turn off rules that conflict with Svelte
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
        },
      ],
    },
  },

  // Global ignores
  {
    ignores: [
      '.svelte-kit/**',
      'build/**',
      'dist/**',
      'node_modules/**',
      '**/*.js.map',
      '**/*.d.ts',
      'data.sqlite3',
    ],
  },
];
