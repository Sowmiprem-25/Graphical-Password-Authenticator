/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1F3A5F',
          50: '#E8EDF4',
          100: '#C5D3E6',
          200: '#9DB5D3',
          300: '#7597C0',
          400: '#4E7AAD',
          500: '#1F3A5F',
          600: '#1A3052',
          700: '#152645',
          800: '#0F1B33',
          900: '#0A1120',
        },
        secondary: {
          DEFAULT: '#4FA3A5',
          50: '#EAF5F5',
          100: '#C9E7E8',
          200: '#A3D6D8',
          300: '#7DC5C7',
          400: '#64B4B7',
          500: '#4FA3A5',
          600: '#3F8A8C',
          700: '#2F6E70',
          800: '#205254',
          900: '#103637',
        },
        accent: {
          DEFAULT: '#F3D37A',
          50: '#FEF9EC',
          100: '#FBF0CC',
          200: '#F8E5A8',
          300: '#F5DA84',
          400: '#F3D37A',
          500: '#F0C84A',
          600: '#E8B81A',
          700: '#B88E10',
          800: '#886A0C',
          900: '#584608',
        },
        bg: '#F5F7FA',
        textDark: '#2D3748',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'bounce-soft': 'bounceSoft 0.6s ease-in-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        'card': '0 4px 24px rgba(31, 58, 95, 0.08)',
        'card-hover': '0 8px 32px rgba(31, 58, 95, 0.16)',
        'glow': '0 0 20px rgba(79, 163, 165, 0.3)',
      },
    },
  },
  plugins: [],
};
