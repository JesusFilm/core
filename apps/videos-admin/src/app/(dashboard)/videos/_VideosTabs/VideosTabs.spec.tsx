import { fireEvent, render, screen } from '@testing-library/react'

import { VideosTabs } from './VideosTabs'

const mockPush = vi.fn()
let mockPathname = '/videos'

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({
    push: mockPush
  })
}))

describe('VideosTabs', () => {
  beforeEach(() => {
    mockPathname = '/videos'
    mockPush.mockClear()
  })

  it('uses Algolia Search as the main /videos tab', () => {
    render(<VideosTabs />)

    expect(screen.getByRole('tab', { name: 'Algolia Search' })).toHaveAttribute(
      'aria-selected',
      'true'
    )
    expect(
      screen.getByRole('tab', { name: 'Library (Backup)' })
    ).toHaveAttribute('aria-selected', 'false')
    expect(
      screen.queryByRole('tab', { name: 'Video Status Pipeline' })
    ).not.toBeInTheDocument()
  })

  it('routes Library to the backup page', () => {
    render(<VideosTabs />)

    fireEvent.click(screen.getByRole('tab', { name: 'Library (Backup)' }))

    expect(mockPush).toHaveBeenCalledWith('/videos/library')
  })

  it('routes Algolia Search back to the main videos page', () => {
    mockPathname = '/videos/library'

    render(<VideosTabs />)

    fireEvent.click(screen.getByRole('tab', { name: 'Algolia Search' }))

    expect(mockPush).toHaveBeenCalledWith('/videos')
  })
})
