/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'capitune-black': '#000000',
        'capitune-dark': '#0a0a0a',
        'capitune-gray': '#1a1a1a',
        'capitune-border': '#2f2f2f',
        'capitune-text': '#71767b',
        'capitune-white': '#e7e9ea',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
