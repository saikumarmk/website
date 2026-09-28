import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import svelte from 'eslint-plugin-svelte'
import globals from 'globals'
import ts from 'typescript-eslint'
import svelteConfig from './svelte.config.ts'

export default ts.config(
  {
    ignores: [
      '.svelte-kit/',
      'build/',
      'node_modules/',
      'static/',
      'design-prototypes/',
      'design-handoff/',
      'test-results/',
      'playwright-report/',
      'src/routes/(drafts)/'
    ]
  },
  js.configs.recommended,
  ...ts.configs.recommended,
  ...svelte.configs.recommended,
  prettier,
  ...svelte.configs.prettier,
  {
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      // TypeScript already reports undefined names, and knows about ambient types that this rule doesn't
      'no-undef': 'off',
      'no-empty': ['error', { allowEmptyCatch: true }],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none' }
      ],
      // the site is served from the root, so plain hrefs are already resolved
      'svelte/no-navigation-without-resolve': 'off',
      // every {@html} renders build-time output from the site's own content (Shiki, KaTeX, embroidery SVG, résumé)
      'svelte/no-at-html-tags': 'off',
      // lists here are static; keys would only matter for reordering
      'svelte/require-each-key': 'off',
      // flags local, non-reactive Set/Map/URL values too
      'svelte/prefer-svelte-reactivity': 'off',
      // {', '} keeps whitespace that Svelte would trim at the edge of an {#if} block
      'svelte/no-useless-mustaches': 'off'
    }
  },
  {
    // third-party plugin and graph-library types don't line up
    files: ['*.config.ts', 'src/routes/growth/**'],
    rules: { '@typescript-eslint/no-explicit-any': 'off' }
  },
  {
    files: ['**/*.svelte', '**/*.svelte.ts'],
    languageOptions: { parserOptions: { parser: ts.parser, extraFileExtensions: ['.svelte'], svelteConfig } }
  }
)
