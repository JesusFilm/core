import { MockedProvider } from '@apollo/client/testing'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { VideoListHeader } from './VideoListHeader'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn().mockReturnValue({
    push: jest.fn()
  }),
  usePathname: jest.fn().mockReturnValue('/videos')
}))

describe('VideoListHeader', () => {
  it('should render', () => {
    render(
      
        <VideoListHeader />
      
    )

    expect(screen.getByText('Video Library')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument()
  })

  it('should show create form when button is clicked', async () => {
    render(
      
        <MockedProvider>
          <VideoListHeader />
        </MockedProvider>
      
    )

    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: 'Create' }))

    expect(screen.getByTestId('VideoCreateForm')).toBeInTheDocument()
  })
})
