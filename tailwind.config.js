/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        trust: {
          DEFAULT: '#173A5E',
          50: '#EAF0F6',
          100: '#CBD9E7',
          200: '#9CB6D0',
          300: '#6D93B8',
          400: '#3E70A1',
          500: '#245685',
          600: '#1B3A5C',
          700: '#173A5E',
          800: '#122B47',
          900: '#0C1D30'
        },
        growth: {
          DEFAULT: '#3FB878',
          50: '#EAF9F0',
          100: '#C9F0DA',
          200: '#96E1B7',
          300: '#63D294',
          400: '#3FB878',
          500: '#2E9A61',
          600: '#237A4C'
        },
        teal: {
          DEFAULT: '#2AC3C5',
          400: '#2AC3C5',
          500: '#1FA5A7'
        },
        amber: {
          DEFAULT: '#F2994A',
          500: '#F2994A',
          600: '#DB7F2E'
        },
        cloud: {
          50: '#F7F8FA',
          100: '#EEF1F4',
          200: '#E1E6EB',
          300: '#C7CFD8'
        }
      },
      fontFamily: {
        display: ['"Baloo 2"', 'ui-rounded', 'sans-serif'],
        body: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      borderRadius: {
        xl2: '1.25rem'
      },
      boxShadow: {
        card: '0 1px 2px rgba(12, 29, 48, 0.06), 0 8px 24px -12px rgba(23, 58, 94, 0.18)'
      },
      maxWidth: {
        app: '480px'
      }
    }
  },
  plugins: []
}
