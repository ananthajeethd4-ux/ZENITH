/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: '#F9F8F6', // warm unbleached paper
          dark: '#F1EFEB',    // soft ivory surface
          subtle: '#EBE7E1',  // deeper paper tint
          muted: '#E3DFD7',   // boundary paper tint
        },
        ink: {
          DEFAULT: '#1A1A1A', // deep charcoal
          secondary: '#5F6670', // calibrated slate
          muted: '#8B929D',   // tertiary slate
          faint: '#B6B9BF',
        },
        slate: {
          primary: '#34465A',  // archival slate navy
          hover: '#2F3F51',
          pressed: '#293747',
          surface: '#EAEFF4',  // very light slate tint for selection / highlights
        },
        edge: {
          DEFAULT: '#DAD7D1',  // warm gray border
          light: '#E8E5DF',
          dark: '#BDB9B0',
        },
        brick: {
          DEFAULT: '#A34A3E',  // semantic alert color
          hover: '#8C3E34',
          surface: '#F8EBEA',  // subdued alert background
          border: '#E8C5C1',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
        mono: [
          '"JetBrains Mono"',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
        serif: [
          '"Newsreader"',
          'Charter',
          'Georgia',
          'serif',
        ],
      },
      boxShadow: {
        tactile: '0 1px 2px rgba(26, 26, 26, 0.04), 0 1px 1px rgba(26, 26, 26, 0.02)',
        'tactile-md': '0 2px 4px rgba(26, 26, 26, 0.06), 0 1px 2px rgba(26, 26, 26, 0.03)',
        'tactile-lg': '0 4px 12px rgba(26, 26, 26, 0.08), 0 1px 3px rgba(26, 26, 26, 0.04)',
      },
    },
  },
  plugins: [],
};

