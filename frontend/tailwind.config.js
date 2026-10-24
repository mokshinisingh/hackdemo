/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#203D35',
          deep: '#294B40',
          dark: '#162B25',
          light: '#2E5549',
        },
        mint: {
          DEFAULT: '#DDEBE5',
          soft: '#EAF3EF',
          accent: '#C5DDD3',
        },
        ivory: {
          DEFAULT: '#F7F6F0',
          warm: '#FAF9F5',
        },
        neutral: {
          light: '#F3F5F3',
          card: '#FCFCFB',
        },
        brand: {
          primary: '#24352F',
          secondary: '#64716B',
          muted: '#8A9690',
          border: '#E1E6E2',
        },
        status: {
          success: '#237A52',
          warning: '#946200',
          error: '#B42318',
          info: '#2864A5',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['Manrope', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        'card': '12px',
        'pill': '9999px',
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(36, 53, 47, 0.05), 0 1px 2px -1px rgba(36, 53, 47, 0.05)',
        'elevated': '0 4px 12px 0 rgba(36, 53, 47, 0.08), 0 2px 4px -2px rgba(36, 53, 47, 0.06)',
        'modal': '0 20px 25px -5px rgba(36, 53, 47, 0.12), 0 8px 10px -6px rgba(36, 53, 47, 0.08)',
      }
    },
  },
  plugins: [],
}
