/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-comfortaa)'],
        comfortaa: ['Comfortaa', 'sans-serif'],
      },
      colors: {
        // Você pode personalizar as cores aqui se desejar
      },
    },
  },
  plugins: [],
}
