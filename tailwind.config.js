/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#4169E1',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'sans-serif'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'fade-in-scale': 'fadeInScale 0.8s ease-out',
        'slide-in-left': 'slideInFromLeft 0.6s ease-out',
        'pulse-slow': 'pulse 3s infinite',
        'bounce-slow': 'bounce 2s infinite',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'primary': '0 10px 25px -5px rgba(65, 105, 225, 0.1), 0 10px 10px -5px rgba(65, 105, 225, 0.1)',
        'primary-lg': '0 20px 40px -10px rgba(65, 105, 225, 0.1), 0 10px 20px -5px rgba(65, 105, 225, 0.1)',
      }
    },
  },
  plugins: [],
}
