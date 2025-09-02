import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen } from '@testing-library/react'
import fscreen from 'fscreen'
import { SnackbarProvider } from 'notistack'

import { VideoProvider } from '../../../libs/videoContext'
import { videos } from '../../Videos/__generated__/testData'

import { VideoHero } from './VideoHero'

// Mock fscreen
jest.mock('fscreen', () => ({
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  get fullscreenElement() {
    return null
  }
}))

describe('VideoHero', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    window.scrollTo = jest.fn()
  })

  it('should render the video hero', () => {
    const { getByText, queryByText, getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <VideoProvider value={{ content: videos[0] }}>
            <VideoHero />
          </VideoProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(getByText('JESUS')).toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: 'Play Video' }))
    expect(queryByText('JESUS')).not.toBeInTheDocument()
  })

  it('should not have header spacer', () => {
    render(
      <MockedProvider>
        <SnackbarProvider>
          <VideoProvider value={{ content: videos[0] }}>
            <VideoHero />
          </VideoProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(screen.getByTestId('Header')).toBeInTheDocument()
    expect(screen.queryByTestId('HeaderSpacer')).not.toBeInTheDocument()
  })

  it('should scroll to top when entering fullscreen mode', () => {
    render(
      <MockedProvider>
        <SnackbarProvider>
          <VideoProvider value={{ content: videos[0] }}>
            <VideoHero />
          </VideoProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    Object.defineProperty(fscreen, 'fullscreenElement', {
      get: jest.fn().mockReturnValue(document.documentElement)
    })

    const fullscreenCallback = (fscreen.addEventListener as jest.Mock).mock
      .calls[0][1]
    fullscreenCallback()

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
  })
})
