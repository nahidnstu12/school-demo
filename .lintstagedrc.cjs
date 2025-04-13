module.exports = {
  '**/src/**/*.{js,jsx,ts,tsx}': ['bun run lint:fix', 'bun run format'],
  '*.{json,css,scss,md,yml,yaml}': ['prettier --write'],
};
