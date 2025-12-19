import { MockedProvider } from '@apollo/client/testing'
import { render, screen } from '@testing-library/react'

import { PlayerProvider } from '../../../libs/playerContext'
import { VideoProvider } from '../../../libs/videoContext'
import { WatchProvider } from '../../../libs/watchContext'
import { videos } from '../../Videos/__generated__/testData'

import { VideoBlockPlayer } from './VideoBlockPlayer'

jest.mock('video.js', () => {
  const originalModule = jest.requireActual('video.js')
  const mockPlayer = {
    on: jest.fn(),
    off: jest.fn(),
    dispose: jest.fn(),
    muted: jest.fn(),
    play: jest.fn().mockReturnValue(Promise.resolve()),
    pause: jest.fn(),
    currentTime: jest.fn(),
    volume: jest.fn(),
    userActive: jest.fn(),
    src: jest.fn(),
    ready: jest.fn((callback) => {
      if (callback) {
        setTimeout(callback, 0)
      }
    }),
    el: jest.fn(() => ({
      classList: {
        add: jest.fn(),
        remove: jest.fn()
      }
    })),
    error: jest.fn(() => null),
    paused: jest.fn(() => false),
    textTracks: jest.fn(() => ({
      length: 0
    }))
  }
  return {
    ...originalModule,
    __esModule: true,
    default: jest.fn(() => mockPlayer)
  }
})

jest.mock('./VideoControls', () => ({
  VideoControls: () => <div data-testid="VideoControls">VideoControls</div>,
  MuxInsertLogoOverlay: () => null
}))

jest.mock('./HeroSubtitleOverlay', () => ({
  HeroSubtitleOverlay: () => (
    <div data-testid="HeroSubtitleOverlay">HeroSubtitleOverlay</div>
  )
}))

describe('VideoBlockPlayer', () => {
  const defaultProps = {
    isPreview: false,
    collapsed: true,
    placement: 'singleVideo' as const
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render video container', () => {
    render(
      <MockedProvider mocks={[]}>
        <VideoProvider value={{ content: videos[0] }}>
          <PlayerProvider>
            <WatchProvider>
              <VideoBlockPlayer {...defaultProps} />
            </WatchProvider>
          </PlayerProvider>
        </VideoProvider>
      </MockedProvider>
    )

    expect(screen.getByTestId('VideoBlockPlayerContainer')).toBeInTheDocument()
  })

  it('should apply height 120% when collapsed is true', () => {
    const { container } = render(
      <MockedProvider mocks={[]}>
        <VideoProvider value={{ content: videos[0] }}>
          <PlayerProvider>
            <WatchProvider>
              <VideoBlockPlayer {...defaultProps} collapsed={true} />
            </WatchProvider>
          </PlayerProvider>
        </VideoProvider>
      </MockedProvider>
    )

    const videoElement = container.querySelector(
      '[data-testid="VideoBlockPlayer"]'
    )
    expect(videoElement).toBeInTheDocument()
    expect(videoElement).toHaveStyle({ height: '120%' })
  })

  it('should apply height 100% when collapsed is false', () => {
    const { container } = render(
      <MockedProvider mocks={[]}>
        <VideoProvider value={{ content: videos[0] }}>
          <PlayerProvider>
            <WatchProvider>
              <VideoBlockPlayer {...defaultProps} collapsed={false} />
            </WatchProvider>
          </PlayerProvider>
        </VideoProvider>
      </MockedProvider>
    )

    const videoElement = container.querySelector(
      '[data-testid="VideoBlockPlayer"]'
    )
    expect(videoElement).toBeInTheDocument()
    expect(videoElement).toHaveStyle({ height: '100%' })
  })

  it('should apply height 120% when collapsed is true for carouselItem placement', () => {
    const { container } = render(
      <MockedProvider mocks={[]}>
        <VideoProvider value={{ content: videos[0] }}>
          <PlayerProvider>
            <WatchProvider>
              <VideoBlockPlayer
                {...defaultProps}
                collapsed={true}
                placement="carouselItem"
              />
            </WatchProvider>
          </PlayerProvider>
        </VideoProvider>
      </MockedProvider>
    )

    const videoElement = container.querySelector(
      '[data-testid="VideoBlockPlayer"]'
    )
    expect(videoElement).toBeInTheDocument()
    expect(videoElement).toHaveStyle({ height: '120%' })
  })

  it('should apply height 100% when collapsed is false for carouselItem placement', () => {
    const { container } = render(
      <MockedProvider mocks={[]}>
        <VideoProvider value={{ content: videos[0] }}>
          <PlayerProvider>
            <WatchProvider>
              <VideoBlockPlayer
                {...defaultProps}
                collapsed={false}
                placement="carouselItem"
              />
            </WatchProvider>
          </PlayerProvider>
        </VideoProvider>
      </MockedProvider>
    )

    const videoElement = container.querySelector(
      '[data-testid="VideoBlockPlayer"]'
    )
    expect(videoElement).toBeInTheDocument()
    expect(videoElement).toHaveStyle({ height: '100%' })
  })
})
