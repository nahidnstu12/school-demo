import pluginJs from '@eslint/js';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import { fixupPluginRules } from '@eslint/compat';
import nextPlugin from '@next/eslint-plugin-next';
import globals from 'globals';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default [
  // Base JavaScript rules
  pluginJs.configs.recommended,

  // TypeScript rules
  {
    languageOptions: {
      parser: tsParser, // Use TypeScript parser
      parserOptions: {
        project: './tsconfig.json', // Ensure ESLint reads TSConfig
        sourceType: 'module',
        ecmaVersion: 'latest',
      },
    },
    plugins: { '@typescript-eslint': tsPlugin },
    rules: {
      ...tsPlugin.configs.recommended.rules, // TypeScript recommended rules
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'warn', // Discourage `any` type
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/consistent-type-imports': 'warn', // Prefer `import type {}` syntax
    },
  },

  // React rules
  pluginReact.configs.flat.recommended,
  {
    plugins: { 'react-hooks': fixupPluginRules(pluginReactHooks) },
    rules: { ...pluginReactHooks.configs.recommended.rules },
  },
  {
    settings: { react: { version: 'detect' } },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',
      'no-undef': 'error',
      'no-useless-escape': 'off',
      'react/prop-types': 'off', // No need for PropTypes in TypeScript
      'no-unused-vars': 'warn',
      'no-var': 'warn',
      'react/jsx-no-duplicate-props': 'warn',
      'react/self-closing-comp': 'off',
      'react/no-array-index-key': 'warn',
      'react/jsx-pascal-case': 'warn',
      'react/destructuring-assignment': ['warn', 'always'],
      'react/no-deprecated': 'warn',
      'react/require-render-return': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react/display-name': 'off',
    },
  },

  // Next.js rules
  {
    plugins: { '@next/next': nextPlugin },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
    },
  },

  // Include TypeScript & JavaScript files
  { files: ['**/*.tsx', '**/*.ts'] },

  // Global variables (Node, Browser, Bun)
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
        Bun: 'readonly',
      },
    },
  },

  // Ignored files & directories
  {
    ignores: [
      '.next/', // Ignore Next.js build output
      'node_modules/', // Ignore dependencies
      'dist/', // Ignore build output
      'out/', // Ignore Next.js static export folder
      'coverage/', // Ignore test coverage reports
      '**/*.min.js', // Ignore minified JS files
      '**/vendor/**', // Ignore vendor files
      '**/public/**', // Ignore public assets
      './next.config.mjs',
      './eslint.config.js',
    ],
  },
];
