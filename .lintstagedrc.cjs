module.exports = {
  '**/src/**/*.{js,jsx,ts,tsx}': [
  'prettier --write',
  'eslint --fix --max-warnings=100'
],
  '*.{json,css,scss,md}': ['prettier --write'],
};
