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
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        sourceType: 'module',
        ecmaVersion: 'latest',
      },
    },
    plugins: { '@typescript-eslint': tsPlugin },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/consistent-type-imports': 'off',
      '--no-warn-ignored': 'off',
    },
  },

  // React rules
  pluginReact.configs.flat.recommended,
  {
    plugins: { 'react-hooks': fixupPluginRules(pluginReactHooks) },
    rules: { ...pluginReactHooks.configs.recommended.rules, '--no-warn-ignored': 'off' },
  },
  {
    settings: { react: { version: 'detect' } },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      'react/jsx-uses-vars': 'error',
      'no-undef': 'error',
      'no-useless-escape': 'off',
      'react/prop-types': 'off',
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
      '--no-warn-ignored': 'off',
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
];
