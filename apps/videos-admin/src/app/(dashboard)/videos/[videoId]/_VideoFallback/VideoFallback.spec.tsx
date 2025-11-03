import { render, screen } from '@testing-library/react'

import { VideoViewFallback } from './VideoFallback'

jest.mock('next/navigation', () => ({
  usePathname: () => '/videos/123'
}))

describe('VideoViewFallback', () => {
  it('renders the fallback component', () => {
    render(<VideoViewFallback />)

    expect(screen.getByText('Video not found')).toBeInTheDocument()
    expect(
      screen.getByText("The video you're looking for could not be found.")
    ).toBeInTheDocument()
    expect(screen.getByText('Back to videos')).toBeInTheDocument()
  })
})
