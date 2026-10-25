/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        radha: {
          50: '#fff1f4',
          100: '#ffe4e9',
          200: '#fecdd7',
          300: '#fda4b8',
          400: '#fb7193',
          500: '#f43f71',
          600: '#e11d59', // Holy Vrindavan Rose Pink
          700: '#be1245',
          800: '#9f123c',
          900: '#881337',
        },
        gold: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706', // Marigold Gold (Genda Phool)
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        teal: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488', // Peacock Feather Teal (Mor-Pankh)
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        sandal: {
          50: '#fdfbf7', // Sandalwood Warm Off-white
          100: '#f9f5ec',
          200: '#f2e9d7',
          300: '#e9d8ba',
          400: '#dec297',
          500: '#ce9f5d',
        },
      },
      fontFamily: {
        devanagari: ['"Mukta"', '"Tiro Devanagari Hindi"', 'sans-serif'],
      },
      boxShadow: {
        divine: '0 4px 20px -2px rgba(225, 29, 89, 0.15)',
        goldglow: '0 4px 20px -2px rgba(217, 119, 6, 0.25)',
      },
    },
  },
  plugins: [],
};
