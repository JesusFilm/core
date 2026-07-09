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
      screen.getByRole('tab', { name: 'Status Pipeline' })
    ).toHaveAttribute('aria-selected', 'false')
  })

  it('routes Library to the backup page', () => {
    render(<VideosTabs />)

    fireEvent.click(screen.getByRole('tab', { name: 'Library (Backup)' }))

    expect(mockPush).toHaveBeenCalledWith('/videos/library')
  })

  it('routes Status Pipeline to the status pipeline page', () => {
    render(<VideosTabs />)

    fireEvent.click(screen.getByRole('tab', { name: 'Status Pipeline' }))

    expect(mockPush).toHaveBeenCalledWith('/videos/status-pipeline')
  })

  it('routes Algolia Search back to the main videos page', () => {
    mockPathname = '/videos/status-pipeline'

    render(<VideosTabs />)

    fireEvent.click(screen.getByRole('tab', { name: 'Algolia Search' }))

    expect(mockPush).toHaveBeenCalledWith('/videos')
  })
})
