module.exports = {
  '*.{js,jsx,ts,tsx}': [
    'prettier --write',
    'eslint --fix --max-warnings=100', // Allow warnings to pass
  ],
  '*.{json,css,scss,md}': ['prettier --write'],
};
