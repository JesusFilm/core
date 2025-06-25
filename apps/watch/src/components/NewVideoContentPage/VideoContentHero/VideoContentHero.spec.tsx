import { render } from '@testing-library/react'
import fscreen from 'fscreen'

import { VideoProvider } from '../../../libs/videoContext'
import { videos } from '../../Videos/__generated__/testData'

import { VideoContentHero } from './VideoContentHero'

jest.mock('fscreen')

jest.mock('next-i18next', () => ({
  useTranslation: jest.fn().mockReturnValue({
    t: (key: string) => key
  })
}))

const mockedFscreen = fscreen as jest.Mocked<typeof fscreen> & {
  fullscreenElement: Element | null
}

const originalScrollTo = window.scrollTo

describe('VideoContentHero', () => {
  const setIsFullscreen = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    window.scrollTo = jest.fn()
  })

  afterEach(() => {
    window.scrollTo = originalScrollTo
    jest.clearAllMocks()
  })

  it('adds and removes fullscreenchange event listener', () => {
    const { unmount } = render(
      <VideoProvider value={{ content: videos[0] }}>
        <VideoContentHero isFullscreen setIsFullscreen={setIsFullscreen} />
      </VideoProvider>
    )
    expect(mockedFscreen.addEventListener).toHaveBeenCalledWith(
      'fullscreenchange',
      expect.any(Function)
    )

    const listener = (mockedFscreen.addEventListener as jest.Mock).mock
      .calls[0][1]

    unmount()
    expect(mockedFscreen.removeEventListener).toHaveBeenCalledWith(
      'fullscreenchange',
      listener
    )
  })

  describe('fullscreenchange handler', () => {
    it('calls setIsFullscreen and scrolls to top when entering fullscreen', () => {
      render(
        <VideoProvider value={{ content: videos[0] }}>
          <VideoContentHero isFullscreen setIsFullscreen={setIsFullscreen} />
        </VideoProvider>
      )
      const fullscreenchangeCallback = (
        mockedFscreen.addEventListener as jest.Mock
      ).mock.calls[0][1]

      ;(mockedFscreen as any).fullscreenElement = document.createElement('div')
      fullscreenchangeCallback()

      expect(setIsFullscreen).toHaveBeenCalledWith(true)
      expect(window.scrollTo).toHaveBeenCalledWith({
        top: 0,
        behavior: 'smooth'
      })
    })

    it('calls setIsFullscreen and scrolls to top when entering fullscreen', () => {
      render(
        <VideoProvider value={{ content: videos[0] }}>
          <VideoContentHero isFullscreen setIsFullscreen={setIsFullscreen} />
        </VideoProvider>
      )
      const fullscreenchangeCallback = (
        mockedFscreen.addEventListener as jest.Mock
      ).mock.calls[0][1]

      ;(mockedFscreen as any).fullscreenElement = document.createElement('div')
      fullscreenchangeCallback()

      expect(setIsFullscreen).toHaveBeenCalledWith(true)
      expect(window.scrollTo).toHaveBeenCalledWith({
        top: 0,
        behavior: 'smooth'
      })
    })

    it('calls setIsFullscreen when exiting fullscreen', () => {
      render(
        <VideoProvider value={{ content: videos[0] }}>
          <VideoContentHero isFullscreen setIsFullscreen={setIsFullscreen} />
        </VideoProvider>
      )
      const fullscreenchangeCallback = (
        mockedFscreen.addEventListener as jest.Mock
      ).mock.calls[0][1]

      ;(mockedFscreen as any).fullscreenElement = null
      fullscreenchangeCallback()

      expect(setIsFullscreen).toHaveBeenCalledWith(false)
    })
  })
})
