import { render, screen } from '@testing-library/react'

import { VideoListHeader } from './VideoListHeader'

vi.mock('next/navigation', () => ({
  useRouter: vi.fn().mockReturnValue({
    push: vi.fn()
  }),
  usePathname: vi.fn().mockReturnValue('/videos')
}))

describe('VideoListHeader', () => {
  it('should render', () => {
    render(<VideoListHeader />)

    expect(screen.getByText('Video Library')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument()
  })
})
