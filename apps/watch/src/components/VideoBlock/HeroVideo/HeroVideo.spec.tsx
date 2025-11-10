import { render, screen } from '@testing-library/react'

import { PlayerProvider } from '../../../../libs/playerContext/PlayerContext'
import { VideoProvider } from '../../../../libs/videoContext'
import { WatchProvider } from '../../../../libs/watchContext'
import { videos } from '../../../Videos/__generated__/testData'

import { HeroVideo } from './HeroVideo'

jest.mock('video.js', () => {
  const mockPlayer = {
    on: jest.fn(),
    off: jest.fn(),
    dispose: jest.fn(),
    muted: jest.fn(),
    play: jest.fn(),
    pause: jest.fn(),
    currentTime: jest.fn(),
    volume: jest.fn(),
    userActive: jest.fn()
  }
  return jest.fn(() => mockPlayer)
})

jest.mock('../../VideoContentPage/VideoHero/VideoPlayer/VideoControls', () => ({
  VideoControls: () => <div data-testid="VideoControls">VideoControls</div>,
  MuxInsertLogoOverlay: () => null
}))

jest.mock('./HeroSubtitleOverlay', () => ({
  HeroSubtitleOverlay: () => <div data-testid="HeroSubtitleOverlay">HeroSubtitleOverlay</div>
}))

describe('HeroVideo', () => {
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
      <VideoProvider value={{ content: videos[0] }}>
        <PlayerProvider>
          <WatchProvider>
            <HeroVideo {...defaultProps} />
          </WatchProvider>
        </PlayerProvider>
      </VideoProvider>
    )

    expect(screen.getByTestId('ContentHeroVideoContainer')).toBeInTheDocument()
  })

  it('should apply height 120% when collapsed is true', () => {
    const { container } = render(
      <VideoProvider value={{ content: videos[0] }}>
        <PlayerProvider>
          <WatchProvider>
            <HeroVideo {...defaultProps} collapsed={true} />
          </WatchProvider>
        </PlayerProvider>
      </VideoProvider>
    )

    const videoElement = container.querySelector('[data-testid="ContentHeroVideo"]')
    expect(videoElement).toBeInTheDocument()
    expect(videoElement).toHaveStyle({ height: '120%' })
  })

  it('should apply height 100% when collapsed is false', () => {
    const { container } = render(
      <VideoProvider value={{ content: videos[0] }}>
        <PlayerProvider>
          <WatchProvider>
            <HeroVideo {...defaultProps} collapsed={false} />
          </WatchProvider>
        </PlayerProvider>
      </VideoProvider>
    )

    const videoElement = container.querySelector('[data-testid="ContentHeroVideo"]')
    expect(videoElement).toBeInTheDocument()
    expect(videoElement).toHaveStyle({ height: '100%' })
  })

  it('should apply height 120% when collapsed is true for carouselItem placement', () => {
    const { container } = render(
      <VideoProvider value={{ content: videos[0] }}>
        <PlayerProvider>
          <WatchProvider>
            <HeroVideo {...defaultProps} collapsed={true} placement="carouselItem" />
          </WatchProvider>
        </PlayerProvider>
      </VideoProvider>
    )

    const videoElement = container.querySelector('[data-testid="ContentHeroVideo"]')
    expect(videoElement).toBeInTheDocument()
    expect(videoElement).toHaveStyle({ height: '120%' })
  })

  it('should apply height 100% when collapsed is false for carouselItem placement', () => {
    const { container } = render(
      <VideoProvider value={{ content: videos[0] }}>
        <PlayerProvider>
          <WatchProvider>
            <HeroVideo {...defaultProps} collapsed={false} placement="carouselItem" />
          </WatchProvider>
        </PlayerProvider>
      </VideoProvider>
    )

    const videoElement = container.querySelector('[data-testid="ContentHeroVideo"]')
    expect(videoElement).toBeInTheDocument()
    expect(videoElement).toHaveStyle({ height: '100%' })
  })
})


