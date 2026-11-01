/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#172033',
          light: '#2a3754',
        },
        muted: '#6f788a',
        purple: {
          DEFAULT: '#6855e8',
          dark: '#4c3bc3',
          light: '#8575eb',
        },
        lavender: '#f2efff',
        line: '#e8eaf1',
        surface: '#ffffff',
        bg: '#fafaff',
        orange: {
          DEFAULT: '#ff8c38',
        },
        green: {
          DEFAULT: '#10b981',
        },
        red: {
          DEFAULT: '#ef4444',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['Manrope', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        card: '0 16px 45px rgba(37, 31, 83, 0.09)',
        cardHover: '0 20px 50px rgba(37, 31, 83, 0.16)',
      },
      borderRadius: {
        brand: '16px',
      },
    },
  },
  plugins: [],
}

