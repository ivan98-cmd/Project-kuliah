import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        syncevent: {
          dark: '#241B4D',
          deep: '#3B3086',
          blue: '#5058F0',
          violet: '#7C53F2',
        },
      },
      boxShadow: {
        card: '0 20px 60px rgba(17, 16, 81, 0.12)',
      },
    },
  },
  plugins: [],
};

export default config;
