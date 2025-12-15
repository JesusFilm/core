import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { PlaylistList } from '.'

const mockItems = [
  {
    id: 'item-1',
    order: 1,
    videoVariant: {
      id: 'variant-1',
      hls: 'https://example.com/video1.m3u8',
      duration: 3661,
      language: {
        id: 'lang-1',
        name: [{ value: 'English' }]
      },
      video: {
        id: 'video-1',
        title: [{ value: 'Test Video 1' }],
        images: [{ mobileCinematicHigh: 'https://example.com/thumb1.jpg' }]
      }
    }
  },
  {
    id: 'item-2',
    order: 2,
    videoVariant: {
      id: 'variant-2',
      hls: null,
      duration: 125,
      language: {
        id: 'lang-2',
        name: [{ value: 'Spanish' }]
      },
      video: {
        id: 'video-2',
        title: [{ value: 'Test Video 2' }],
        images: [{ mobileCinematicHigh: null }]
      }
    }
  },
  {
    id: 'item-3',
    order: 3,
    videoVariant: {
      id: 'variant-3',
      hls: 'https://example.com/video3.m3u8',
      duration: 90,
      language: {
        id: 'lang-3',
        name: [{ value: 'French' }]
      },
      video: null
    }
  }
]

describe('PlaylistList', () => {
  const mockOnVideoSelect = jest.fn()

  beforeEach(() => {
    mockOnVideoSelect.mockClear()
  })

  it('renders all playlist items', () => {
    render(
      <PlaylistList
        items={mockItems}
        activeIndex={0}
        onVideoSelect={mockOnVideoSelect}
      />
    )
    expect(screen.getByText('Test Video 1')).toBeInTheDocument()
    expect(screen.getByText('Test Video 2')).toBeInTheDocument()
  })

  it('highlights active item', () => {
    const { container } = render(
      <PlaylistList
        items={mockItems}
        activeIndex={0}
        onVideoSelect={mockOnVideoSelect}
      />
    )
    const activeButton = screen.getByText('Test Video 1').closest('button')
    expect(activeButton).toHaveClass('bg-purple-50', 'dark:bg-red-900')
  })

  it('shows play icon for active item', () => {
    render(
      <PlaylistList
        items={mockItems}
        activeIndex={0}
        onVideoSelect={mockOnVideoSelect}
      />
    )
    const activeButton = screen.getByText('Test Video 1').closest('button')
    const svg = activeButton?.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('calls onVideoSelect when item is clicked', async () => {
    const user = userEvent.setup()
    const itemsWithHls = [
      mockItems[0],
      {
        id: 'item-3',
        order: 3,
        videoVariant: {
          id: 'variant-3',
          hls: 'https://example.com/video3.m3u8',
          duration: 90,
          language: {
            id: 'lang-3',
            name: [{ value: 'French' }]
          },
          video: {
            id: 'video-3',
            title: [{ value: 'Test Video 3' }],
            images: [{ mobileCinematicHigh: null }]
          }
        }
      }
    ]
    render(
      <PlaylistList
        items={itemsWithHls}
        activeIndex={0}
        onVideoSelect={mockOnVideoSelect}
      />
    )

    const item3 = screen.getByText('Test Video 3')
    await user.click(item3.closest('button')!)

    expect(mockOnVideoSelect).toHaveBeenCalledWith(1)
  })

  it('formats duration correctly for hours', () => {
    render(
      <PlaylistList
        items={mockItems}
        activeIndex={0}
        onVideoSelect={mockOnVideoSelect}
      />
    )
    expect(screen.getByText('1:01:01')).toBeInTheDocument()
  })

  it('formats duration correctly for minutes', () => {
    render(
      <PlaylistList
        items={mockItems}
        activeIndex={1}
        onVideoSelect={mockOnVideoSelect}
      />
    )
    expect(screen.getByText('2:05')).toBeInTheDocument()
  })

  it('displays thumbnail when available', () => {
    render(
      <PlaylistList
        items={mockItems}
        activeIndex={0}
        onVideoSelect={mockOnVideoSelect}
      />
    )
    const img = screen.getByAltText('Test Video 1')
    expect(img).toHaveAttribute('src', 'https://example.com/thumb1.jpg')
  })

  it('displays no thumbnail message when thumbnail is missing', () => {
    const itemsWithoutThumbnail = [
      {
        id: 'item-1',
        order: 1,
        videoVariant: {
          id: 'variant-1',
          hls: 'https://example.com/video1.m3u8',
          duration: 125,
          language: {
            id: 'lang-1',
            name: [{ value: 'English' }]
          },
          video: {
            id: 'video-1',
            title: [{ value: 'Test Video 1' }],
            images: [{ mobileCinematicHigh: null }]
          }
        }
      }
    ]
    render(
      <PlaylistList
        items={itemsWithoutThumbnail}
        activeIndex={0}
        onVideoSelect={mockOnVideoSelect}
      />
    )
    expect(screen.getByText('noThumbnail')).toBeInTheDocument()
  })

  it('displays language name when available', () => {
    render(
      <PlaylistList
        items={mockItems}
        activeIndex={0}
        onVideoSelect={mockOnVideoSelect}
      />
    )
    expect(screen.getByText('English')).toBeInTheDocument()
  })

  it('disables item without HLS', () => {
    render(
      <PlaylistList
        items={mockItems}
        activeIndex={1}
        onVideoSelect={mockOnVideoSelect}
      />
    )
    const disabledButton = screen.getByText('Test Video 2').closest('button')
    expect(disabledButton).toBeDisabled()
    expect(disabledButton).toHaveClass('cursor-not-allowed', 'opacity-50')
  })

  it('does not call onVideoSelect for disabled item', async () => {
    const user = userEvent.setup()
    render(
      <PlaylistList
        items={mockItems}
        activeIndex={0}
        onVideoSelect={mockOnVideoSelect}
      />
    )

    const disabledButton = screen.getByText('Test Video 2').closest('button')!
    await user.click(disabledButton)

    expect(mockOnVideoSelect).not.toHaveBeenCalled()
  })

  it('handles video with null title', () => {
    render(
      <PlaylistList
        items={mockItems}
        activeIndex={2}
        onVideoSelect={mockOnVideoSelect}
      />
    )
    expect(screen.getByText('Untitled')).toBeInTheDocument()
  })

  it('handles missing language name', () => {
    const itemWithoutLanguage = [
      {
        id: 'item-4',
        order: 4,
        videoVariant: {
          id: 'variant-4',
          hls: 'https://example.com/video4.m3u8',
          duration: 60,
          language: {
            id: 'lang-4',
            name: []
          },
          video: {
            id: 'video-4',
            title: [{ value: 'Video 4' }],
            images: [{ mobileCinematicHigh: null }]
          }
        }
      }
    ]
    render(
      <PlaylistList
        items={itemWithoutLanguage}
        activeIndex={0}
        onVideoSelect={mockOnVideoSelect}
      />
    )
    expect(screen.getByText('Video 4')).toBeInTheDocument()
  })
})
