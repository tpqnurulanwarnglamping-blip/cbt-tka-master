import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ecfdf7',
          100: '#d1faea',
          200: '#a7f3d9',
          300: '#6ee7c4',
          400: '#34d3aa',
          500: '#23a68a',
          600: '#1a8a72',
          700: '#176e5c',
          800: '#16574a',
          900: '#14483e',
        },
        coral: {
          500: '#ea5455',
        },
        amberGold: {
          500: '#fab839',
        },
      },
    },
  },
  plugins: [],
};

export default config;
