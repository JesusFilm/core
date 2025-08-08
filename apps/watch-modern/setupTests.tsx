import '@testing-library/jest-dom'
import 'isomorphic-fetch'
import { configure } from '@testing-library/react'

configure({ asyncUtilTimeout: 2500 })

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  )
}))

// Mock carousel components to prevent browser API errors in tests
jest.mock('@/components/ui/carousel', () => ({
  Carousel: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className} data-testid="carousel">
      {children}
    </div>
  ),
  CarouselContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className} data-testid="carousel-content">
      {children}
    </div>
  ),
  CarouselItem: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className} data-testid="carousel-item">
      {children}
    </div>
  ),
  CarouselNext: ({ className }: { className?: string }) => (
    <button className={className} aria-label="Next slide" data-testid="carousel-next">
      Next
    </button>
  ),
  CarouselPrevious: ({ className }: { className?: string }) => (
    <button className={className} aria-label="Previous slide" data-testid="carousel-previous">
      Previous
    </button>
  ),
}))

Object.defineProperty(
  window.navigator,
  'userAgent',
  ((value) => ({
    get() {
      return value
    },
    set(v) {
      value = v
    }
  }))(window.navigator.userAgent)
)

jest.mock('next/router', () => require('next-router-mock'))

if (process.env['CI'] === 'true')
  jest.retryTimes(3, { logErrorsBeforeRetry: true })
