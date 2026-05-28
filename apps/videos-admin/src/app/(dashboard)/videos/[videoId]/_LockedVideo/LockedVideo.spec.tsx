import { render, screen } from '@testing-library/react'
import { usePathname } from 'next/navigation'
import { type Mock } from 'vitest'

import { LockedVideoView } from './LockedVideo'

vi.mock('next/navigation', () => ({
  usePathname: vi.fn()
}))

describe('LockedVideoView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(usePathname as Mock).mockReturnValue('/videos/123')
  })

  it('should render correctly', () => {
    render(<LockedVideoView />)

    expect(screen.getByText('Video is locked')).toBeInTheDocument()
    expect(screen.getByText('Back to videos')).toBeInTheDocument()
  })
})
