import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { PlaylistPage } from '.'

import { createMockPlaylist } from '@/test/mockData'

jest.mock('@/env', () => ({
  env: {
    NEXT_PUBLIC_IOS_APP_ID: '123456789'
  }
}))

jest.mock('@/components/VideoPlayer', () => ({
  VideoPlayer: ({
    onVideoEnd,
    videoTitle
  }: {
    onVideoEnd?: () => void
    videoTitle: string
  }) => (
    <div data-testid="video-player" onClick={onVideoEnd}>
      {videoTitle}
    </div>
  )
}))

describe('PlaylistPage', () => {
  it('renders playlist with valid video', () => {
    const playlist = createMockPlaylist()
    render(<PlaylistPage playlist={playlist} />)

    expect(screen.getByText('Test Playlist')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getAllByText('Test Video').length).toBeGreaterThan(0)
  })

  it('renders no video available state when HLS is missing', () => {
    const playlist = createMockPlaylist({
      items: [
        {
          id: 'item-1',
          order: 1,
          videoVariant: {
            id: 'variant-1',
            hls: null,
            duration: 3600,
            language: {
              id: 'lang-1',
              name: [{ value: 'English' }]
            },
            video: {
              id: 'video-1',
              title: [{ value: 'Test Video' }],
              description: [],
              studyQuestions: [],
              images: []
            }
          }
        }
      ]
    })

    render(<PlaylistPage playlist={playlist} />)

    expect(screen.getByText('Test Playlist')).toBeInTheDocument()
    expect(screen.getByText(/noVideoAvailable/i)).toBeInTheDocument()
  })

  it('displays owner name correctly with last name', () => {
    const playlist = createMockPlaylist({
      owner: {
        id: 'owner-1',
        firstName: 'Jane',
        lastName: 'Smith'
      }
    })

    render(<PlaylistPage playlist={playlist} />)
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
  })

  it('displays owner name correctly without last name', () => {
    const playlist = createMockPlaylist({
      owner: {
        id: 'owner-1',
        firstName: 'Jane',
        lastName: null
      }
    })

    render(<PlaylistPage playlist={playlist} />)
    expect(screen.getByText('Jane')).toBeInTheDocument()
  })

  it('changes active video when item is selected', async () => {
    const user = userEvent.setup()
    const playlist = createMockPlaylist({
      items: [
        {
          id: 'item-1',
          order: 1,
          videoVariant: {
            id: 'variant-1',
            hls: 'https://example.com/video1.m3u8',
            duration: 3600,
            language: {
              id: 'lang-1',
              name: [{ value: 'English' }]
            },
            video: {
              id: 'video-1',
              title: [{ value: 'Video 1' }],
              description: [],
              studyQuestions: [],
              images: []
            }
          }
        },
        {
          id: 'item-2',
          order: 2,
          videoVariant: {
            id: 'variant-2',
            hls: 'https://example.com/video2.m3u8',
            duration: 1800,
            language: {
              id: 'lang-2',
              name: [{ value: 'Spanish' }]
            },
            video: {
              id: 'video-2',
              title: [{ value: 'Video 2' }],
              description: [],
              studyQuestions: [],
              images: []
            }
          }
        }
      ]
    })

    render(<PlaylistPage playlist={playlist} />)

    expect(screen.getByTestId('video-player')).toHaveTextContent('Video 1')

    const video2Button = screen.getByText('Video 2').closest('button')
    await user.click(video2Button)

    await waitFor(() => {
      expect(screen.getByTestId('video-player')).toHaveTextContent('Video 2')
    })
  })

  it('auto-advances to next video on video end', async () => {
    const playlist = createMockPlaylist({
      items: [
        {
          id: 'item-1',
          order: 1,
          videoVariant: {
            id: 'variant-1',
            hls: 'https://example.com/video1.m3u8',
            duration: 3600,
            language: {
              id: 'lang-1',
              name: [{ value: 'English' }]
            },
            video: {
              id: 'video-1',
              title: [{ value: 'Video 1' }],
              description: [],
              studyQuestions: [],
              images: []
            }
          }
        },
        {
          id: 'item-2',
          order: 2,
          videoVariant: {
            id: 'variant-2',
            hls: 'https://example.com/video2.m3u8',
            duration: 1800,
            language: {
              id: 'lang-2',
              name: [{ value: 'Spanish' }]
            },
            video: {
              id: 'video-2',
              title: [{ value: 'Video 2' }],
              description: [],
              studyQuestions: [],
              images: []
            }
          }
        }
      ]
    })

    render(<PlaylistPage playlist={playlist} />)

    expect(screen.getByTestId('video-player')).toHaveTextContent('Video 1')

    const videoPlayer = screen.getByTestId('video-player')
    await userEvent.click(videoPlayer)

    await waitFor(() => {
      expect(screen.getByTestId('video-player')).toHaveTextContent('Video 2')
    })
  })

  it('does not advance beyond last video', async () => {
    const playlist = createMockPlaylist({
      items: [
        {
          id: 'item-1',
          order: 1,
          videoVariant: {
            id: 'variant-1',
            hls: 'https://example.com/video1.m3u8',
            duration: 3600,
            language: {
              id: 'lang-1',
              name: [{ value: 'English' }]
            },
            video: {
              id: 'video-1',
              title: [{ value: 'Video 1' }],
              description: [],
              studyQuestions: [],
              images: []
            }
          }
        }
      ]
    })

    render(<PlaylistPage playlist={playlist} />)

    const videoPlayer = screen.getByTestId('video-player')
    await userEvent.click(videoPlayer)

    await waitFor(() => {
      expect(screen.getByTestId('video-player')).toHaveTextContent('Video 1')
    })
  })

  it('renders SharedPlaylistBanner', () => {
    const playlist = createMockPlaylist()
    render(<PlaylistPage playlist={playlist} />)

    expect(screen.getByText(/sharedWithYou/i)).toBeInTheDocument()
  })

  it('renders TopNavBar', () => {
    const playlist = createMockPlaylist()
    const { container } = render(<PlaylistPage playlist={playlist} />)

    expect(container.querySelector('nav')).toBeInTheDocument()
  })

  it('renders VideoMetadata when video is available', () => {
    const playlist = createMockPlaylist()
    render(<PlaylistPage playlist={playlist} />)

    expect(screen.getAllByText('Test Video').length).toBeGreaterThan(0)
  })
})
