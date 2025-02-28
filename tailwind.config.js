const { heroui } = require('@heroui/react');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{ts,tsx}', // Next.js app router
    './src/components/**/*.{ts,tsx}', // Components folder
    './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}', // HeroUI styles
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
    },
  },
  darkMode: 'class',
  plugins: [heroui()],
};
