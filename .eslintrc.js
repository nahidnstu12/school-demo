module.exports = {
  extends: ['next/core-web-vitals', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  root: true,
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': 'warn',
  },
  overrides: [
    {
      // Specify files that are not TypeScript
      files: ['.eslintrc.js', 'commitlint.config.js', '*.js'],
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 2020,
      },
      env: {
        node: true,
        browser: false,
      },
    },
    {
      // For TypeScript files
      files: ['*.ts', '*.tsx'],
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
      },
    },
  ],
};
