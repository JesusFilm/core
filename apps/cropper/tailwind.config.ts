import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#0c0a09',
        accent: '#ffffff',
        danger: '#ef4444',
        success: '#22c55e'
      },
      boxShadow: {
        floating: '0 20px 45px -20px rgba(255, 255, 255, 0.35)'
      }
    }
  },
  plugins: []
}

export default config
