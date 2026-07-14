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

  it('keeps Library selected for the main /videos tab', () => {
    render(<VideosTabs />)

    expect(screen.getByRole('tab', { name: 'Library' })).toHaveAttribute(
      'aria-selected',
      'true'
    )
    expect(
      screen.getByRole('tab', { name: 'Algolia (Experimental)' })
    ).toHaveAttribute('aria-selected', 'false')
    expect(
      screen.getByRole('tab', { name: 'Algolia Debugging' })
    ).toHaveAttribute('aria-selected', 'false')
  })

  it('routes Algolia Debugging to the debugging page', () => {
    render(<VideosTabs />)

    fireEvent.click(screen.getByRole('tab', { name: 'Algolia Debugging' }))

    expect(mockPush).toHaveBeenCalledWith('/videos/algolia-debugging')
  })

  it('routes Algolia Experimental to the algolia page', () => {
    render(<VideosTabs />)

    fireEvent.click(screen.getByRole('tab', { name: 'Algolia (Experimental)' }))

    expect(mockPush).toHaveBeenCalledWith('/videos/algolia')
  })

  it('routes Library back to the main videos page', () => {
    mockPathname = '/videos/algolia-debugging'

    render(<VideosTabs />)

    fireEvent.click(screen.getByRole('tab', { name: 'Library' }))

    expect(mockPush).toHaveBeenCalledWith('/videos')
  })
})
