import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'
import fscreen from 'fscreen'

import { VideoProvider } from '../../../libs/videoContext'
import { WatchProvider } from '../../../libs/watchContext'
import { videos } from '../../Videos/__generated__/testData'

import { VideoContentHero } from './VideoContentHero'

jest.mock('fscreen')

jest.mock('next-i18next', () => ({
  useTranslation: jest.fn().mockReturnValue({
    t: (key: string) => key
  })
}))

const mockedFscreen = fscreen

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
      <MockedProvider>
        <VideoProvider value={{ content: videos[0] }}>
          <WatchProvider
            initialState={{
              siteLanguage: 'en',
              audioLanguage: 'en',
              subtitleLanguage: 'en',
              subtitleOn: false
            }}
          >
            <VideoContentHero isFullscreen setIsFullscreen={setIsFullscreen} />
          </WatchProvider>
        </VideoProvider>
      </MockedProvider>
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
        <MockedProvider>
          <VideoProvider value={{ content: videos[0] }}>
            <WatchProvider
              initialState={{
                siteLanguage: 'en',
                audioLanguage: 'en',
                subtitleLanguage: 'en',
                subtitleOn: false
              }}
            >
              <VideoContentHero
                isFullscreen
                setIsFullscreen={setIsFullscreen}
              />
            </WatchProvider>
          </VideoProvider>
        </MockedProvider>
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
        <MockedProvider>
          <VideoProvider value={{ content: videos[0] }}>
            <WatchProvider
              initialState={{
                siteLanguage: 'en',
                audioLanguage: 'en',
                subtitleLanguage: 'en',
                subtitleOn: false
              }}
            >
              <VideoContentHero
                isFullscreen
                setIsFullscreen={setIsFullscreen}
              />
            </WatchProvider>
          </VideoProvider>
        </MockedProvider>
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
        <MockedProvider>
          <VideoProvider value={{ content: videos[0] }}>
            <WatchProvider
              initialState={{
                siteLanguage: 'en',
                audioLanguage: 'en',
                subtitleLanguage: 'en',
                subtitleOn: false
              }}
            >
              <VideoContentHero
                isFullscreen
                setIsFullscreen={setIsFullscreen}
              />
            </WatchProvider>
          </VideoProvider>
        </MockedProvider>
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
