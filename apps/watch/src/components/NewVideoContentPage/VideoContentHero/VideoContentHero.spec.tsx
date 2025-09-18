import { MockedProvider } from '@apollo/client/testing'
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import fscreen from 'fscreen'

import {
  PlayerProvider,
  PlayerState
} from '../../../libs/playerContext/PlayerContext'
import { VideoProvider } from '../../../libs/videoContext'
import { WatchProvider } from '../../../libs/watchContext'
import { videos } from '../../Videos/__generated__/testData'

import { VideoContentHero } from './VideoContentHero'

jest.mock('fscreen')

const mockPush = jest.fn()
const mockPrefetch = jest.fn()

jest.mock('next/router', () => ({
  useRouter: jest.fn(() => ({
    push: mockPush,
    prefetch: mockPrefetch
  }))
}))

jest.mock('@next/third-parties/google', () => ({
  sendGTMEvent: jest.fn()
}))

jest.mock('./HeroVideo', () => ({
  HeroVideo: jest.fn(() => {
    const React = require('react') as typeof import('react')
    return React.createElement('div', { 'data-testid': 'HeroVideoMock' }, 'HeroVideo')
  })
}))

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
    mockPush.mockResolvedValue(true)
    mockPrefetch.mockResolvedValue(undefined)
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
              audioLanguageId: '529',
              subtitleLanguageId: '529',
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
                audioLanguageId: '529',
                subtitleLanguageId: '529',
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
                audioLanguageId: '529',
                subtitleLanguageId: '529',
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
                audioLanguageId: '529',
                subtitleLanguageId: '529',
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

describe('up next panel', () => {
  it('becomes visible when nearing the end of the video', async () => {
    render(
      <MockedProvider>
        <VideoProvider value={{ content: videos[0] }}>
          <PlayerProvider
            initialState={{
              play: true,
              durationSeconds: 120,
              progress: 115
            }}
          >
            <WatchProvider
              initialState={{
                audioLanguageId: '529',
                subtitleLanguageId: '529',
                subtitleOn: false
              }}
            >
              <VideoContentHero
                nextUpVideo={{
                  id: 'next-video',
                  title: 'Next Video',
                  href: '/watch/next-video.html',
                  durationSeconds: 90
                }}
              />
            </WatchProvider>
          </PlayerProvider>
        </VideoProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(screen.getByTestId('UpNextPanel')).toHaveClass('translate-x-0')
    )
  })
})
