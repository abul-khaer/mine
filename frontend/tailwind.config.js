/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#f0f7f0',
          100: '#d8ecd8',
          200: '#b3d9b3',
          300: '#84be84',
          400: '#559d55',
          500: '#3a7d3a',
          600: '#2d6332',
          700: '#254f28',
          800: '#1e3d20',
          900: '#152b16',
        },
        earth: {
          50:  '#faf6f0',
          100: '#f2e8d8',
          200: '#e3cfb0',
          300: '#d0b080',
          400: '#b8885a',
          500: '#9c6b3c',
          600: '#7f5230',
          700: '#643e24',
          800: '#4a2d1a',
          900: '#321e10',
        },
        forest: {
          light: '#84A98C',
          mid:   '#52796F',
          dark:  '#354F52',
          deep:  '#2F3E46',
          bg:    '#1E3A2F',
        },
        cream: {
          50:  '#FEFAE0',
          100: '#F5F0E8',
          200: '#EDE8DC',
          300: '#DDD8CC',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'forest-gradient': 'linear-gradient(135deg, #1E3A2F 0%, #2d6332 50%, #3a7d3a 100%)',
        'earth-gradient':  'linear-gradient(135deg, #2F3E46 0%, #354F52 50%, #52796F 100%)',
        'cream-gradient':  'linear-gradient(135deg, #FEFAE0 0%, #F5F0E8 100%)',
      },
    },
  },
  plugins: [],
}
