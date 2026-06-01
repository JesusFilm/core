import { render, waitFor } from '@testing-library/react'

import {
  VideoBlockObjectFit,
  VideoBlockSource
} from '../../../../../../../../../__generated__/globalTypes'

import { MuxDetails } from './MuxDetails'

const mockDocument = globalThis.document

vi.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: vi.fn()
}))

vi.mock('video.js', () => {
  const videojs = vi.fn(
    (
      element?: HTMLVideoElement | null,
      options?: { poster?: string | null }
    ) => {
      if (element != null) {
        element.classList.add('vjs-tech')
        const posterParent = element.parentElement
        if (posterParent != null) {
          posterParent.querySelector('.vjs-poster')?.remove()
          if (options?.poster != null) {
            const posterContainer = mockDocument.createElement('div')
            posterContainer.className = 'vjs-poster'
            const pictureElement = mockDocument.createElement('picture')
            const imageElement = mockDocument.createElement('img')
            imageElement.setAttribute('src', options.poster)
            pictureElement.appendChild(imageElement)
            posterContainer.appendChild(pictureElement)
            posterParent.appendChild(posterContainer)
          }
        }
      }

      return {
        on: vi.fn(),
        off: vi.fn(),
        poster: vi.fn(),
        src: vi.fn()
      }
    }
  )

  ;(videojs as any).getPlayers = vi.fn(() => ({}))
  return { __esModule: true, default: videojs }
})

vi.mock('@core/journeys/ui/Video/utils/getCaptionsAndSubtitleTracks', () => ({
  getCaptionsAndSubtitleTracks: vi.fn(() => [])
}))

const mockVideoBlock = {
  __typename: 'VideoBlock' as const,
  id: 'videoId',
  parentBlockId: 'parentBlockId',
  parentOrder: 0,
  muted: false,
  autoplay: false,
  startAt: 0,
  endAt: 10,
  posterBlockId: null,
  fullsize: true,
  children: [],
  videoId: 'videoId',
  videoVariantLanguageId: null,
  source: VideoBlockSource.mux,
  title: 'title',
  description: null,
  image: null,
  duration: 10,
  objectFit: VideoBlockObjectFit.fill,
  subtitleLanguage: null,
  showGeneratedSubtitles: false,
  action: null,
  eventLabel: null,
  endEventLabel: null,
  customizable: null,
  notes: null,
  mediaVideo: {
    __typename: 'MuxVideo' as const,
    id: 'videoId',
    assetId: 'assetId',
    playbackId: 'playbackId'
  }
}

describe('MuxDetails', () => {
  it('should render details of a video', async () => {
    const { getByRole } = render(
      <MuxDetails activeVideoBlock={mockVideoBlock} open onSelect={vi.fn()} />
    )
    const videoPlayer = getByRole('region', {
      name: 'Video Player'
    })
    const sourceTag = videoPlayer.querySelector('.vjs-tech source')
    expect(sourceTag?.getAttribute('src')).toBe(
      'https://stream.mux.com/playbackId.m3u8'
    )
    expect(sourceTag?.getAttribute('type')).toBe('application/x-mpegURL')
    const imageTag = videoPlayer.querySelector('.vjs-poster > picture > img')
    expect(imageTag?.getAttribute('src')).toBe(
      'https://image.mux.com/playbackId/thumbnail.png?time=1'
    )
  })

  it('should show subtitles when showGeneratedSubtitles is true', async () => {
    const videoBlockWithSubtitles = {
      ...mockVideoBlock,
      showGeneratedSubtitles: true
    }

    const { getByRole } = render(
      <MuxDetails
        activeVideoBlock={videoBlockWithSubtitles}
        open
        onSelect={vi.fn()}
      />
    )

    await waitFor(() => {
      const videoPlayer = getByRole('region', {
        name: 'Video Player'
      })
      expect(videoPlayer).toBeInTheDocument()
    })
  })

  it('should hide subtitles when showGeneratedSubtitles is false', async () => {
    const videoBlockWithoutSubtitles = {
      ...mockVideoBlock,
      showGeneratedSubtitles: false
    }

    const { getByRole } = render(
      <MuxDetails
        activeVideoBlock={videoBlockWithoutSubtitles}
        open
        onSelect={vi.fn()}
      />
    )

    await waitFor(() => {
      const videoPlayer = getByRole('region', {
        name: 'Video Player'
      })
      expect(videoPlayer).toBeInTheDocument()
    })
  })

  it('should not render when open is false', () => {
    const { queryByTestId } = render(
      <MuxDetails
        activeVideoBlock={mockVideoBlock}
        open={false}
        onSelect={vi.fn()}
      />
    )

    expect(queryByTestId('MuxDetails')).toBeInTheDocument()
  })

  it('should update subtitle tracks on showGeneratedSubtitles change', async () => {
    const { rerender, getByRole } = render(
      <MuxDetails activeVideoBlock={mockVideoBlock} open onSelect={vi.fn()} />
    )

    await waitFor(() => {
      expect(
        getByRole('region', {
          name: 'Video Player'
        })
      ).toBeInTheDocument()
    })

    // Re-render with showGeneratedSubtitles true
    const updatedBlock = {
      ...mockVideoBlock,
      showGeneratedSubtitles: true
    }

    rerender(
      <MuxDetails activeVideoBlock={updatedBlock} open onSelect={vi.fn()} />
    )

    await waitFor(() => {
      expect(
        getByRole('region', {
          name: 'Video Player'
        })
      ).toBeInTheDocument()
    })
  })

  it('should render video element with correct attributes', () => {
    const { container } = render(
      <MuxDetails activeVideoBlock={mockVideoBlock} open onSelect={vi.fn()} />
    )

    const videoElement = container.querySelector('video')
    expect(videoElement).toBeInTheDocument()
    expect(videoElement).toHaveClass('video-js')
    expect(videoElement).toHaveClass('vjs-big-play-centered')
    expect(videoElement).toHaveAttribute('playsInline')
  })
})
