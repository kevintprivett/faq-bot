import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import globals from 'globals'

export default tseslint.config(
  // --- Ignored paths ---
  {
    ignores: ['dist/**', 'node_modules/**', '.wrangler/**'],
  },

  // --- Base configs ---
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // --- Project config ---
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      // Workers run in a browser-like / service worker environment
      globals: {
        ...globals.browser,
      },
    },

    rules: {
      // --- TypeScript ---
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports' },
      ],

      // --- Block Node.js built-ins unavailable in Workers ---
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                'fs',
                'fs/*',
                'path',
                'os',
                'child_process',
                'cluster',
                'http',
                'https',
                'net',
                'tls',
                'dns',
                'dgram',
                'readline',
                'repl',
                'vm',
              ],
              message:
                'Node.js built-in modules are not available in Cloudflare Workers. Use the Web API equivalent instead.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-floating-promises': 'error',
    },
  }
)
