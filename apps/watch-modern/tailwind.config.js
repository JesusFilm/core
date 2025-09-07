/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{ts,tsx,js,jsx,mdx}",
    "../../packages/**/*.{ts,tsx,js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Carousel specific colors for theme alignment
        carousel: {
          bg: 'hsl(var(--background))', // Match page background
          overlay: {
            start: 'rgba(0, 0, 0, 0.8)', // Stronger bottom gradient
            middle: 'rgba(0, 0, 0, 0.1)', // Soft middle transition
            end: 'rgba(0, 0, 0, 0)', // Transparent top
          },
          text: {
            primary: 'hsl(var(--foreground))', // White text for contrast
            secondary: 'rgba(255, 255, 255, 0.9)', // High contrast secondary
            muted: 'rgba(255, 255, 255, 0.7)', // Medium contrast muted
          },
        },
      },
      fontSize: {
        // Responsive typography scale for carousel
        'carousel-title': ['clamp(1.5rem, 4vw, 2.5rem)', { lineHeight: '1.2' }],
        'carousel-description': ['clamp(1rem, 2.5vw, 1.25rem)', { lineHeight: '1.6' }],
        'carousel-meta': ['clamp(0.875rem, 2vw, 1rem)', { lineHeight: '1.5' }],
      },
      animation: {
        // Smooth transitions for carousel
        'carousel-fade': 'carouselFade 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
        'carousel-slide': 'carouselSlide 0.5s ease-out',
      },
      keyframes: {
        carouselFade: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0.3' },
        },
        carouselSlide: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
    }
  },
  plugins: [],
}