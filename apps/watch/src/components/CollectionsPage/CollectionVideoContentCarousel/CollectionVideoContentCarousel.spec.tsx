import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useRouter } from 'next/router'

import { CollectionVideoContentCarousel } from './CollectionVideoContentCarousel'

jest.mock('next/router', () => ({
  useRouter: jest.fn()
}))

jest.mock('next-i18next', () => ({
  useTranslation: jest.fn().mockReturnValue({
    t: jest.fn().mockImplementation((key) => key)
  })
}))

jest.mock('../CollectionVideoPlayer/CollectionVideoPlayer', () => ({
  CollectionVideoPlayer: ({
    contentId,
    title,
    mutePage,
    setMutePage
  }: {
    contentId: string
    title: string
    mutePage: boolean
    setMutePage: (mute: boolean) => void
  }) => (
    <div data-testid="video-player">
      <div data-testid="video-player-content-id">{contentId}</div>
      <div data-testid="video-player-title">{title}</div>
      <div data-testid="video-player-mute-state">
        {mutePage ? 'muted' : 'unmuted'}
      </div>
      <button
        data-testid="video-player-toggle-mute"
        onClick={() => setMutePage(!mutePage)}
      >
        Toggle Mute
      </button>
    </div>
  )
}))

describe('CollectionVideoContentCarousel', () => {
  const mockRouter = {
    push: jest.fn()
  }

  const defaultProps = {
    id: 'test-id',
    title: 'Test Title',
    subtitle: 'Test Subtitle',
    description: 'First four words and remaining text of the description',
    contentId: 'content-1',
    videoTitle: 'Video 1',
    slides: [
      {
        contentId: 'content-1',
        imageUrl: '/image1.jpg',
        backgroundColor: '#123456',
        title: 'Video 1',
        type: 'Short'
      },
      {
        contentId: 'content-2',
        imageUrl: '/image2.jpg',
        backgroundColor: '#654321',
        title: 'Video 2',
        type: 'Feature'
      },
      {
        contentId: 'content-3',
        imageUrl: '/image3.jpg',
        backgroundColor: '#333333',
        title: 'Video 3'
      }
    ],
    mutePage: false,
    setMutePage: jest.fn(),
    seeAllText: 'See All',
    shortVideoText: 'Short'
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
  })

  it('renders the component with all props correctly', async () => {
    render(<CollectionVideoContentCarousel {...defaultProps} />)

    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByText('First four words and')).toBeInTheDocument()
    })
    expect(screen.getByText('See All')).toBeInTheDocument()

    expect(screen.getByTestId('video-player')).toBeInTheDocument()
    expect(screen.getByTestId('video-player-content-id')).toHaveTextContent(
      'content-1'
    )
    expect(screen.getByTestId('video-player-title')).toHaveTextContent(
      'Video 1'
    )

    await waitFor(() => {
      expect(
        screen.getAllByTestId('CollectionVideoContentCarouselSlides')
      ).toHaveLength(3)
    })
  })

  it('changes video when a slide is clicked', async () => {
    render(<CollectionVideoContentCarousel {...defaultProps} />)

    expect(screen.getByTestId('video-player-content-id')).toHaveTextContent(
      'content-1'
    )
    expect(screen.getByTestId('video-player-title')).toHaveTextContent(
      'Video 1'
    )

    const slides = screen.getAllByTestId('CollectionVideoContentCarouselSlides')
    fireEvent.click(slides[1])

    await waitFor(() => {
      expect(screen.getByTestId('video-player-content-id')).toHaveTextContent(
        'content-2'
      )
    })

    expect(screen.getByTestId('video-player-title')).toHaveTextContent(
      'Video 2'
    )
  })

  it('does not change video when the currently selected slide is clicked again', () => {
    render(<CollectionVideoContentCarousel {...defaultProps} />)

    expect(screen.getByTestId('video-player-content-id')).toHaveTextContent(
      'content-1'
    )

    const slides = screen.getAllByTestId('CollectionVideoContentCarouselSlides')
    fireEvent.click(slides[0])

    expect(screen.getByTestId('video-player-content-id')).toHaveTextContent(
      'content-1'
    )
  })

  it('should have the correct link for see all button', () => {
    render(<CollectionVideoContentCarousel {...defaultProps} />)

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute(
      'href',
      'https://www.jesusfilm.org/watch?utm_source=jesusfilm-watch'
    )
  })

  it('passes mute state to video player and handles mute changes', () => {
    const setMutePageMock = jest.fn()
    render(
      <CollectionVideoContentCarousel
        {...defaultProps}
        mutePage={true}
        setMutePage={setMutePageMock}
      />
    )

    expect(screen.getByTestId('video-player-mute-state')).toHaveTextContent(
      'muted'
    )

    const toggleMuteButton = screen.getByTestId('video-player-toggle-mute')
    fireEvent.click(toggleMuteButton)

    expect(setMutePageMock).toHaveBeenCalledWith(false)
  })

  it('formats description with first four words bold', () => {
    const propsWithLongDescription = {
      ...defaultProps,
      description: 'These are the first four words followed by more text.'
    }

    render(<CollectionVideoContentCarousel {...propsWithLongDescription} />)

    const boldText = screen.getByText('These are the first')
    expect(boldText).toBeInTheDocument()
    expect(boldText).toHaveStyle('fontWeight: bold')
    expect(boldText).toHaveStyle('color: rgb(255, 255, 255)')

    expect(
      screen.getByText('four words followed by more text.')
    ).toBeInTheDocument()
  })
})
