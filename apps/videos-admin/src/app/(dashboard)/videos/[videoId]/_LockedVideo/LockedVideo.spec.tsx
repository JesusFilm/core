import { render, screen } from '@testing-library/react'
import { usePathname } from 'next/navigation'

import { LockedVideoView } from './LockedVideo'

jest.mock('next/navigation', () => ({
  usePathname: jest.fn()
}))

describe('LockedVideoView', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(usePathname as jest.Mock).mockReturnValue('/videos/123')
  })

  it('should render correctly', () => {
    render(<LockedVideoView />)

    expect(screen.getByText('Video is locked')).toBeInTheDocument()
    expect(screen.getByText('Back to videos')).toBeInTheDocument()
  })
})
