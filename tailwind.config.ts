import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: {
            50: '#eef6ff',
            100: '#d9ecff',
            200: '#b7dbff',
            300: '#8cc3ff',
            400: '#5aa6ff',
            500: '#2e8aff',
            600: '#176fe6',
            700: '#1257b4',
            800: '#0f468f',
            900: '#0d3a75'
          },
          green: {
            50: '#eefaf3',
            100: '#d8f2e3',
            200: '#b5e4c9',
            300: '#86d2a8',
            400: '#56c089',
            500: '#2ea468',
            600: '#1e8753',
            700: '#176b42',
            800: '#135435',
            900: '#0f452b'
          },
          gray: {
            50: '#f9fafb',
            100: '#f3f4f6',
            200: '#e5e7eb',
            300: '#d1d5db',
            400: '#9ca3af',
            500: '#6b7280',
            600: '#4b5563',
            700: '#374151',
            800: '#1f2937',
            900: '#111827'
          }
        }
      }
    },
  },
  plugins: [],
};

export default config;
