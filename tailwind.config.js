/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0a3d62',
          dark: '#062b46',
          accent: '#e58e26',
        },
      },
    },
  },
  // Flexbox `gap` and `position: sticky` are unsupported on the old Chrome
  // WebView builds shipped with Android 5/6, so we never use those Tailwind
  // utilities in markup (margin/space-* utilities are used instead).
  corePlugins: {
    backdropBlur: false,
    backdropFilter: false,
  },
  plugins: [],
};
