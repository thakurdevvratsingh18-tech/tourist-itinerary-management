/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f2f7f2',
          100: '#e0ede0',
          200: '#c2dbc2',
          300: '#97c197',
          400: '#67a067',
          500: '#3d7a3d',
          600: '#2d5f2d',
          700: '#254d25',
          800: '#1e3d1e',
          900: '#193019',
        },
        ivory: '#FDFBF7',
        beige: '#F5F0E8',
        charcoal: '#2C2C2C',
        terracotta: '#C1694F',
      },
      fontFamily: {
        sans: ['IBM Plex Sans', 'Inter', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
      borderRadius: {
        DEFAULT: '4px',
        sm: '4px',
        md: '6px',
        lg: '8px',
        xl: '8px',
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
