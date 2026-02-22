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
        background: '#0F0F23',
        surface: '#1A1A2E',
        primary: '#FF6D5A',
        accent: '#00D4FF',
        success: '#00FF94',
        warning: '#FFD93D',
        error: '#FF4D6D',
        'text-primary': '#F0F0F0',
        'text-secondary': '#9090A0',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '8px',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
export default config;
