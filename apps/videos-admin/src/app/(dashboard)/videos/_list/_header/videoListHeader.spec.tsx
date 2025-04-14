import { MockedProvider } from '@apollo/client/testing'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { VideoListHeader } from './videoListHeader'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn().mockReturnValue({
    push: jest.fn()
  }),
  usePathname: jest.fn().mockReturnValue('/videos')
}))

describe('VideoListHeader', () => {
  it('should render', () => {
    render(<VideoListHeader />)

    expect(screen.getByText('Video Library')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument()
  })
})
