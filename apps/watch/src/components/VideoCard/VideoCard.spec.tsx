import { fireEvent, render, screen } from '@testing-library/react'

import { videos } from '../Videos/__generated__/testData'

import { VideoCard } from '.'
import { useThumbnailUrl } from '../../libs/thumbnail'

jest.mock('../../libs/blurhash', () => ({
  useBlurhash: jest.fn(() => ({
    blurhash: 'test-blurhash',
    dominantColor: '#000000',
    isLoading: false,
    error: null
  })),
  blurImage: jest.fn(() => 'data:image/webp;base64,test')
}))
jest.mock('../../libs/thumbnail', () => ({
  useThumbnailUrl: jest.fn(() => ({
    thumbnailUrl: null,
    isLoading: false,
    error: null
  }))
}))
jest.mock('../../libs/watchContext', () => ({
  useWatch: jest.fn(() => ({
    state: { audioLanguageId: '529' }
  }))
}))

const useThumbnailUrlMock = useThumbnailUrl as jest.MockedFunction<
  typeof useThumbnailUrl
>

describe('VideoCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('displays image', () => {
    useThumbnailUrlMock.mockReturnValue({
      thumbnailUrl: videos[0].images[0].mobileCinematicHigh ?? null,
      isLoading: false,
      error: null
    })
    const { getByRole } = render(<VideoCard video={videos[0]} />)
    const img = getByRole('img')
    expect(img).toHaveAttribute('src', videos[0].images[0].mobileCinematicHigh)
    expect(img).toHaveAttribute('alt', videos[0].title[0].value)
  })

  it('sets link to video url', () => {
    render(<VideoCard video={videos[0]} />)
    const [videoId, languageId] = (videos[0].variant?.slug as string).split('/')
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      `/${videoId}.html/${languageId}.html`
    )
  })

  it('sets link to video url with container slug', () => {
    render(<VideoCard video={videos[0]} containerSlug="container" />)
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      `/container.html/${videos[0].variant?.slug as string}.html`
    )
  })

  it('sets link to video url without container slug when collection', () => {
    render(<VideoCard video={videos[9]} containerSlug="jesus" />)
    const [videoId, languageId] = (videos[9].variant?.slug as string).split('/')
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      `/${videoId}.html/${languageId}.html`
    )
  })

  it('sets link to video url without container slug when series', () => {
    render(<VideoCard video={videos[5]} containerSlug="jesus" />)
    const [videoId, languageId] = (videos[5].variant?.slug as string).split('/')
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      `/${videoId}.html/${languageId}.html`
    )
  })

  it('displays feature film', () => {
    render(<VideoCard video={videos[0]} />)
    expect(screen.getByText('JESUS')).toBeInTheDocument()
    expect(screen.getByText('Feature Film')).toBeInTheDocument()
    expect(screen.getByText('61 chapters')).toBeInTheDocument()
  })

  it('displays segment', () => {
    render(<VideoCard video={videos[2]} />)
    expect(screen.getByText('Jesus Calms the Storm')).toBeInTheDocument()
    expect(screen.getByText('Chapter')).toBeInTheDocument()
    expect(screen.getByText('1:59')).toBeInTheDocument()
  })

  it('displays series', () => {
    render(<VideoCard video={videos[5]} />)
    expect(screen.getByText('Reflections of Hope')).toBeInTheDocument()
    expect(screen.getByText('Series')).toBeInTheDocument()
    expect(screen.getByText('7 episodes')).toBeInTheDocument()
  })

  it('displays episode', () => {
    render(<VideoCard video={videos[6]} />)
    expect(screen.getByText('Day 6: Jesus Died for Me')).toBeInTheDocument()
    expect(screen.getByText('Episode')).toBeInTheDocument()
    expect(screen.getByText('8:08')).toBeInTheDocument()
  })

  it('displays collection', () => {
    render(<VideoCard video={videos[9]} />)
    expect(screen.getByText('LUMO')).toBeInTheDocument()
    expect(screen.getByText('Collection')).toBeInTheDocument()
    expect(screen.getByText('5 items')).toBeInTheDocument()
  })

  it('displays short film', () => {
    render(<VideoCard video={videos[12]} />)
    expect(screen.getByText('Chosen Witness')).toBeInTheDocument()
    expect(screen.getByText('Short Film')).toBeInTheDocument()
    expect(screen.getByText('9:25')).toBeInTheDocument()
  })

  it('displays playing now', () => {
    render(<VideoCard video={videos[0]} active />)
    expect(screen.getByText('Playing now')).toBeInTheDocument()
  })

  describe('no video', () => {
    it('displays placeholders when contained', () => {
      useThumbnailUrlMock.mockReturnValue({
        thumbnailUrl: null,
        isLoading: false,
        error: null
      })
      render(<VideoCard />)
      expect(screen.getByTestId('VideoImageSkeleton')).toBeInTheDocument()
      expect(screen.getByTestId('VideoTitleSkeleton')).toBeInTheDocument()
      expect(screen.getByTestId('VideoLabelSkeleton')).toBeInTheDocument()
      expect(
        screen.getByTestId('VideoVariantDurationSkeleton')
      ).toBeInTheDocument()
    })

    it('displays placeholders when expanded', () => {
      useThumbnailUrlMock.mockReturnValue({
        thumbnailUrl: null,
        isLoading: false,
        error: null
      })
      render(<VideoCard />)
      expect(screen.getByTestId('VideoImageSkeleton')).toBeInTheDocument()
      expect(screen.getByTestId('VideoTitleSkeleton')).toBeInTheDocument()
      expect(screen.getByTestId('VideoLabelSkeleton')).toBeInTheDocument()
      expect(
        screen.getByTestId('VideoVariantDurationSkeleton')
      ).toBeInTheDocument()
    })

    it('should set link pointer-events to none', () => {
      render(<VideoCard />)
      expect(screen.getByRole('link')).toHaveClass('pointer-events-none')
    })
  })

  describe('hover functionality', () => {
    it('should call onHoverImageChange with image data object on mouse enter', () => {
      const onHoverImageChange = jest.fn()
      render(
        <VideoCard video={videos[0]} onHoverImageChange={onHoverImageChange} />
      )

      const button = screen.getByRole('button')
      fireEvent.mouseEnter(button)

      expect(onHoverImageChange).toHaveBeenCalledWith({
        imageUrl: videos[0].images[0].mobileCinematicHigh,
        blurhash: 'test-blurhash',
        dominantColor: '#000000'
      })
    })

    it('should call onHoverImageChange with null on mouse leave', () => {
      const onHoverImageChange = jest.fn()
      render(
        <VideoCard video={videos[0]} onHoverImageChange={onHoverImageChange} />
      )

      const button = screen.getByRole('button')
      fireEvent.mouseLeave(button)

      expect(onHoverImageChange).toHaveBeenCalledWith(null)
    })

    it('should not call onHoverImageChange when no video data', () => {
      const onHoverImageChange = jest.fn()
      render(<VideoCard onHoverImageChange={onHoverImageChange} />)

      const button = screen.getByRole('button')
      fireEvent.mouseEnter(button)

      expect(onHoverImageChange).not.toHaveBeenCalled()
    })
  })
})
