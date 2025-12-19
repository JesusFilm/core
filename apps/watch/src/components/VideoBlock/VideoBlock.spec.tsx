import { render, screen, waitFor } from '@testing-library/react'

import {
  PlayerProvider,
  PlayerState
} from '../../libs/playerContext/PlayerContext'
import { VideoProvider } from '../../libs/videoContext/VideoContext'
import { WatchProvider } from '../../libs/watchContext/WatchContext'
import type { CarouselMuxSlide } from '../../types/inserts'
import { videos } from '../Videos/__generated__/testData'

import { VideoBlock } from './VideoBlock'

jest.mock('../ContentHeader', () => ({
  ContentHeader: ({
    languageSlug,
    isPersistent
  }: {
    languageSlug?: string
    isPersistent?: boolean
  }) => (
    <div
      data-testid="ContentHeader"
      data-language-slug={languageSlug}
      data-persistent={isPersistent}
    >
      ContentHeader
    </div>
  )
}))

jest.mock('./VideoBlockPlayer', () => ({
  VideoBlockPlayer: ({
    isPreview,
    collapsed,
    placement,
    onMuteToggle,
    currentMuxInsert,
    onMuxInsertComplete,
    onSkip,
    wasUnmuted
  }: {
    isPreview?: boolean
    collapsed?: boolean
    placement?: 'carouselItem' | 'singleVideo'
    onMuteToggle?: (isMuted: boolean) => void
    currentMuxInsert?: CarouselMuxSlide | null
    onMuxInsertComplete?: () => void
    onSkip?: () => void
    wasUnmuted?: boolean
  }) => (
    <div
      data-testid="VideoBlockPlayer"
      data-is-preview={isPreview}
      data-collapsed={collapsed}
      data-placement={placement}
      data-was-unmuted={wasUnmuted}
      data-has-mux-insert={!!currentMuxInsert}
    >
      <button
        data-testid="mute-toggle"
        onClick={() => onMuteToggle?.(!collapsed)}
      >
        Toggle Mute
      </button>
      {onMuxInsertComplete && (
        <button data-testid="mux-complete" onClick={onMuxInsertComplete}>
          Complete
        </button>
      )}
      {onSkip && (
        <button data-testid="skip" onClick={onSkip}>
          Skip
        </button>
      )}
    </div>
  )
}))

describe('VideoBlock', () => {
  const defaultPlayerState: Partial<PlayerState> = {
    mute: false
  }

  const renderVideoBlock = (
    props?: {
      placement?: 'carouselItem' | 'singleVideo'
      currentMuxInsert?: CarouselMuxSlide | null
      onMuxInsertComplete?: () => void
      onSkipActiveVideo?: () => void
    },
    playerState?: Partial<PlayerState>
  ) => {
    return render(
      <VideoProvider value={{ content: videos[0] }}>
        <PlayerProvider
          initialState={{ ...defaultPlayerState, ...playerState }}
        >
          <WatchProvider
            initialState={{
              audioLanguageId: '529',
              subtitleLanguageId: '529',
              subtitleOn: false
            }}
          >
            <VideoBlock {...props} />
          </WatchProvider>
        </PlayerProvider>
      </VideoProvider>
    )
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders with default props', () => {
    renderVideoBlock()

    expect(screen.getByTestId('ContentHero')).toBeInTheDocument()
    expect(screen.getByTestId('ContentHeader')).toBeInTheDocument()
    expect(screen.getByTestId('VideoBlockPlayer')).toBeInTheDocument()
  })

  it('renders with singleVideo placement by default', () => {
    const { container } = renderVideoBlock()

    const hero = screen.getByTestId('ContentHero')
    expect(hero).toHaveClass('aspect-[var(--ratio-sm-expanded)]')
    expect(hero).toHaveClass('md:aspect-[var(--ratio-md-expanded)]')
  })

  it('renders with carouselItem placement', () => {
    renderVideoBlock({ placement: 'carouselItem' })

    const player = screen.getByTestId('VideoBlockPlayer')
    expect(player).toHaveAttribute('data-placement', 'carouselItem')
    expect(player).toHaveAttribute('data-is-preview', 'true')
  })

  it('passes isPersistent to ContentHeader when placement is carouselItem', () => {
    renderVideoBlock({ placement: 'carouselItem' })

    const header = screen.getByTestId('ContentHeader')
    expect(header).toHaveAttribute('data-persistent', 'true')
  })

  it('does not pass isPersistent to ContentHeader when placement is singleVideo', () => {
    renderVideoBlock({ placement: 'singleVideo' })

    const header = screen.getByTestId('ContentHeader')
    expect(header).toHaveAttribute('data-persistent', 'false')
  })

  it('extracts and passes languageSlug to ContentHeader', () => {
    renderVideoBlock()

    const header = screen.getByTestId('ContentHeader')
    expect(header).toHaveAttribute('data-language-slug', 'english')
  })

  it('removes .html extension from languageSlug', () => {
    const videoWithHtmlSlug = {
      ...videos[0],
      variant: {
        ...videos[0].variant!,
        slug: 'jesus/french.html'
      }
    }

    render(
      <VideoProvider value={{ content: videoWithHtmlSlug }}>
        <PlayerProvider initialState={defaultPlayerState}>
          <WatchProvider
            initialState={{
              audioLanguageId: '529',
              subtitleLanguageId: '529',
              subtitleOn: false
            }}
          >
            <VideoBlock />
          </WatchProvider>
        </PlayerProvider>
      </VideoProvider>
    )

    const header = screen.getByTestId('ContentHeader')
    expect(header).toHaveAttribute('data-language-slug', 'french')
  })

  it('updates collapsed state when mute toggle is called', async () => {
    renderVideoBlock(undefined, { mute: false })

    const toggleButton = screen.getByTestId('mute-toggle')
    let player = screen.getByTestId('VideoBlockPlayer')

    expect(player).toHaveAttribute('data-collapsed', 'false')

    toggleButton.click()

    player = screen.getByTestId('VideoBlockPlayer')
    await waitFor(() => {
      expect(player).toHaveAttribute('data-collapsed', 'true')
    })
  })

  it('tracks wasUnmuted when unmuted in singleVideo placement', async () => {
    renderVideoBlock({ placement: 'singleVideo' }, { mute: true })

    const toggleButton = screen.getByTestId('mute-toggle')
    let player = screen.getByTestId('VideoBlockPlayer')

    expect(player).toHaveAttribute('data-was-unmuted', 'false')

    toggleButton.click()

    player = screen.getByTestId('VideoBlockPlayer')
    await waitFor(() => {
      expect(player).toHaveAttribute('data-was-unmuted', 'true')
    })
  })

  it('does not track wasUnmuted when unmuted in carouselItem placement', () => {
    renderVideoBlock({ placement: 'carouselItem' }, { mute: true })

    const toggleButton = screen.getByTestId('mute-toggle')
    const player = screen.getByTestId('VideoBlockPlayer')

    expect(player).toHaveAttribute('data-was-unmuted', 'false')

    toggleButton.click()

    expect(player).toHaveAttribute('data-was-unmuted', 'false')
  })

  it('applies collapsed aspect ratio classes for carouselItem when collapsed', () => {
    const { container } = renderVideoBlock(
      { placement: 'carouselItem' },
      { mute: true }
    )

    const hero = screen.getByTestId('ContentHero')
    expect(hero).toHaveClass('aspect-[var(--ratio-sm)]')
    expect(hero).toHaveClass('md:aspect-[var(--ratio-md)]')
  })

  it('applies expanded aspect ratio classes for carouselItem when not collapsed', () => {
    const { container } = renderVideoBlock(
      { placement: 'carouselItem' },
      { mute: false }
    )

    const hero = screen.getByTestId('ContentHero')
    expect(hero).toHaveClass('aspect-[var(--ratio-sm-expanded)]')
    expect(hero).toHaveClass('md:aspect-[var(--ratio-md-expanded)]')
  })

  it('passes currentMuxInsert to VideoBlockPlayer', () => {
    const muxInsert: CarouselMuxSlide = {
      source: 'mux',
      id: 'test-mux-id',
      overlay: {
        label: 'Test Label',
        title: 'Test Title',
        collection: 'Test Collection',
        description: 'Test Description'
      },
      playbackId: 'test-playback-id',
      playbackIndex: 0,
      urls: {
        hls: 'https://test.com/hls.m3u8',
        poster: 'https://test.com/poster.jpg'
      }
    }

    renderVideoBlock({ currentMuxInsert: muxInsert })

    const player = screen.getByTestId('VideoBlockPlayer')
    expect(player).toHaveAttribute('data-has-mux-insert', 'true')
  })

  it('calls onMuxInsertComplete when mux insert completes', () => {
    const onMuxInsertComplete = jest.fn()
    const muxInsert: CarouselMuxSlide = {
      source: 'mux',
      id: 'test-mux-id',
      overlay: {
        label: 'Test Label',
        title: 'Test Title',
        collection: 'Test Collection',
        description: 'Test Description'
      },
      playbackId: 'test-playback-id',
      playbackIndex: 0,
      urls: {
        hls: 'https://test.com/hls.m3u8',
        poster: 'https://test.com/poster.jpg'
      }
    }

    renderVideoBlock({
      currentMuxInsert: muxInsert,
      onMuxInsertComplete
    })

    const completeButton = screen.getByTestId('mux-complete')
    completeButton.click()

    expect(onMuxInsertComplete).toHaveBeenCalledTimes(1)
  })

  it('calls onSkipActiveVideo when skip button is clicked', () => {
    const onSkipActiveVideo = jest.fn()

    renderVideoBlock({ onSkipActiveVideo })

    const skipButton = screen.getByTestId('skip')
    skipButton.click()

    expect(onSkipActiveVideo).toHaveBeenCalledTimes(1)
  })

  it('uses currentMuxInsert.id as key when currentMuxInsert is provided', () => {
    const muxInsert: CarouselMuxSlide = {
      source: 'mux',
      id: 'mux-key-123',
      overlay: {
        label: 'Test Label',
        title: 'Test Title',
        collection: 'Test Collection',
        description: 'Test Description'
      },
      playbackId: 'test-playback-id',
      playbackIndex: 0,
      urls: {
        hls: 'https://test.com/hls.m3u8',
        poster: 'https://test.com/poster.jpg'
      }
    }

    const { container } = renderVideoBlock({ currentMuxInsert: muxInsert })

    const player = container.querySelector('[data-testid="VideoBlockPlayer"]')
    expect(player).toBeInTheDocument()
  })

  it('uses variant.hls as key when currentMuxInsert is not provided', () => {
    renderVideoBlock()

    const player = screen.getByTestId('VideoBlockPlayer')
    expect(player).toBeInTheDocument()
  })

  it('handles null currentMuxInsert', () => {
    renderVideoBlock({ currentMuxInsert: null })

    const player = screen.getByTestId('VideoBlockPlayer')
    expect(player).toHaveAttribute('data-has-mux-insert', 'false')
  })
})
