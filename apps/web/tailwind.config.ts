import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: '#c9a227',
        champagne: '#f6e7c1',
        midnight: '#11131a',
      },
      fontFamily: {
        display: ['var(--font-cormorant)'],
        sans: ['var(--font-inter)'],
      },
    },
  },
  plugins: [],
} satisfies Config;
