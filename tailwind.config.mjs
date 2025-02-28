import { heroui } from '@heroui/react';

/** @type {import('tailwindcss').Config} */
const config = {
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
  safelist: [
    {
      pattern: /bg-(gray|blue|red|green|yellow|indigo|purple|pink)-(500|600|700|800)/,
    },
  ],
  darkMode: 'class',
  plugins: [heroui()],
};

export default config;
