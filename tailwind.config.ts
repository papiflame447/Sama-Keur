import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        slate900: '#0f172a',
        navy800: '#1e3a8a',
        emerald600: '#059669'
      },
      borderRadius: {
        sm: '4px',
        md: '4px',
        lg: '4px'
      }
    }
  },
  plugins: []
}

export default config
