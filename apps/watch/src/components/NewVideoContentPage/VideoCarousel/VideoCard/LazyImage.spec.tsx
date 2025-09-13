import { render, screen, waitFor } from '@testing-library/react'
import type { ImgHTMLAttributes } from 'react'

import { LazyImage } from './LazyImage'

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: function MockImage(props: ImgHTMLAttributes<HTMLImageElement>) {
    return <img data-testid="next-image" {...props} />
  }
}))

// Mock IntersectionObserver
const originalIntersectionObserver = window.IntersectionObserver
const mockIntersectionObserver = jest.fn()
mockIntersectionObserver.mockReturnValue({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
})
;(
  window as unknown as { IntersectionObserver: typeof mockIntersectionObserver }
).IntersectionObserver = mockIntersectionObserver

describe('LazyImage', () => {
  const defaultProps = {
    src: '/test-image.jpg',
    alt: 'Test image'
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterAll(() => {
    window.IntersectionObserver = originalIntersectionObserver
  })

  it('renders image immediately when priority is true', () => {
    render(<LazyImage {...defaultProps} priority />)

    expect(screen.getByTestId('next-image')).toBeInTheDocument()
    expect(mockIntersectionObserver).not.toHaveBeenCalled()
  })

  it('sets up IntersectionObserver when priority is false', () => {
    render(<LazyImage {...defaultProps} />)

    expect(mockIntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    )
  })

  it('renders image when element comes into view', async () => {
    const mockObserver = {
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn()
    }
    mockIntersectionObserver.mockReturnValue(mockObserver)

    render(<LazyImage {...defaultProps} />)

    // Simulate intersection
    const observerCallback = mockIntersectionObserver.mock.calls[0][0]
    observerCallback([{ isIntersecting: true }])

    await waitFor(() => {
      expect(screen.getByTestId('next-image')).toBeInTheDocument()
    })
  })

  it('passes correct props to Next Image', () => {
    render(
      <LazyImage
        {...defaultProps}
        fill
        priority
        className="test-class"
        style={{ border: '1px solid red' }}
      />
    )

    const image = screen.getByTestId('next-image')
    expect(image).toHaveAttribute('src', '/test-image.jpg')
    expect(image).toHaveAttribute('alt', 'Test image')
    // Basic props are passed correctly
  })
})
