/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Paleta da Tauro Digital
        tauro: {
          primary: '#1a365d',     // Azul escuro principal
          secondary: '#2d5282',   // Azul médio
          accent: '#ed8936',      // Laranja/dourado
          light: '#4a90e2',       // Azul claro
          dark: '#0d1421',        // Azul muito escuro
          gold: '#f6ad55',        // Dourado claro
          orange: '#dd6b20',      // Laranja escuro
          gray: {
            50: '#f7fafc',
            100: '#edf2f7',
            200: '#e2e8f0',
            300: '#cbd5e0',
            400: '#a0aec0',
            500: '#718096',
            600: '#4a5568',
            700: '#2d3748',
            800: '#1a202c',
            900: '#171923',
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
