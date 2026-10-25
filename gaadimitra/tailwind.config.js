/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'var(--color-background)',
        surface: {
          DEFAULT: 'var(--color-surface)',
          light: '#FFFFFF',
          dark: '#0F172A',
          muted: '#F8FAFC',
        },
        card: 'var(--color-card)',
        primary: {
          DEFAULT: 'var(--color-primary)',
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        secondary: 'var(--color-secondary)',
        border: {
          DEFAULT: 'var(--color-border)',
          default: 'var(--color-border)',
        },
        input: 'var(--color-input)',
        placeholder: 'var(--color-placeholder)',
        brand: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
          DEFAULT: '#2563EB',
        },
        slate: {
          850: '#151E2E',
          950: '#0B0F19',
        },
      },
      textColor: {
        primary: 'var(--color-text)',
        secondary: 'var(--color-text-secondary)',
        muted: 'var(--color-placeholder)',
      },
      borderColor: {
        default: 'var(--color-border)',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
      spacing: {
        '13': '3.25rem',
      },
    },
  },
  plugins: [],
};
