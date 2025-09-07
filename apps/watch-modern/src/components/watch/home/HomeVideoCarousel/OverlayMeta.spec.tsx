import { render, screen } from '@testing-library/react'
import { OverlayMeta } from './OverlayMeta'
import { CarouselVideoItem } from '@/server/getCarouselVideos'

// Mock Next.js Link component
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props} data-testid="link">
      {children}
    </a>
  )
}))

describe('OverlayMeta', () => {
  const mockVideo: CarouselVideoItem = {
    id: 'test-video-1',
    label: 'film',
    title: 'Test Movie Title',
    description: 'This is a test description for the video content.',
    slug: 'test-movie-slug',
    variantSlug: 'main',
    hlsUrl: 'https://example.com/video.m3u8',
    imageUrl: 'https://example.com/image.jpg',
    variantLanguagesCount: 12,
    languageSlugOverride: null
  }

  const watchUrl = 'https://www.jesusfilm.org/watch'

  it('renders video title', () => {
    render(<OverlayMeta video={mockVideo} watchUrl={watchUrl} />)

    expect(screen.getByText('Test Movie Title')).toBeInTheDocument()
  })

  it('renders video description', () => {
    render(<OverlayMeta video={mockVideo} watchUrl={watchUrl} />)

    expect(screen.getByText('This is a test description for the video content.')).toBeInTheDocument()
  })

  it('displays correct video type badge', () => {
    render(<OverlayMeta video={mockVideo} watchUrl={watchUrl} />)

    expect(screen.getByText('Film')).toBeInTheDocument()
  })

  it('maps different label types correctly', () => {
    const seriesVideo = { ...mockVideo, label: 'series' }
    const documentaryVideo = { ...mockVideo, label: 'documentary' }
    const courseVideo = { ...mockVideo, label: 'course' }
    const unknownVideo = { ...mockVideo, label: 'unknown' }

    const { rerender } = render(<OverlayMeta video={seriesVideo} watchUrl={watchUrl} />)
    expect(screen.getByText('Series')).toBeInTheDocument()

    rerender(<OverlayMeta video={documentaryVideo} watchUrl={watchUrl} />)
    expect(screen.getByText('Documentary')).toBeInTheDocument()

    rerender(<OverlayMeta video={courseVideo} watchUrl={watchUrl} />)
    expect(screen.getByText('Course')).toBeInTheDocument()

    rerender(<OverlayMeta video={unknownVideo} watchUrl={watchUrl} />)
    expect(screen.getByText('unknown')).toBeInTheDocument()
  })

  it('displays languages count correctly', () => {
    render(<OverlayMeta video={mockVideo} watchUrl={watchUrl} />)

    expect(screen.getByText(/Available in 12 languages/)).toBeInTheDocument()
  })

  it('handles singular language correctly', () => {
    const singleLanguageVideo = { ...mockVideo, variantLanguagesCount: 1 }
    render(<OverlayMeta video={singleLanguageVideo} watchUrl={watchUrl} />)

    expect(screen.getByText(/Available in 1 language/)).toBeInTheDocument()
  })

  it('renders Watch Now button with correct link', () => {
    render(<OverlayMeta video={mockVideo} watchUrl={watchUrl} />)

    const watchNowButton = screen.getByText('Watch Now')
    expect(watchNowButton).toBeInTheDocument()

    const link = screen.getByTestId('link')
    expect(link).toHaveAttribute('href', `${watchUrl}/${mockVideo.slug}`)
  })

  it('constructs Watch Now href correctly with different watch URLs', () => {
    const customWatchUrl = 'https://custom.watch.url'
    render(<OverlayMeta video={mockVideo} watchUrl={customWatchUrl} />)

    const link = screen.getByTestId('link')
    expect(link).toHaveAttribute('href', `${customWatchUrl}/${mockVideo.slug}`)
  })

  it('has proper button styling', () => {
    render(<OverlayMeta video={mockVideo} watchUrl={watchUrl} />)

    const watchNowButton = screen.getByText('Watch Now')

    expect(watchNowButton).toHaveClass(
      'bg-white', 'text-black', 'hover:bg-white/90', 'font-semibold',
      'px-8', 'py-3', 'rounded-full', 'transition-all', 'duration-200',
      'hover:scale-105'
    )
  })

  it('has proper type badge styling', () => {
    render(<OverlayMeta video={mockVideo} watchUrl={watchUrl} />)

    const typeBadge = screen.getByText('Film')

    expect(typeBadge).toHaveClass(
      'inline-flex', 'items-center', 'rounded-full', 'bg-white/10',
      'backdrop-blur-sm', 'px-3', 'py-1', 'text-sm', 'font-medium', 'text-white'
    )
  })

  it('has responsive text sizing', () => {
    render(<OverlayMeta video={mockVideo} watchUrl={watchUrl} />)

    const title = screen.getByText('Test Movie Title')
    const description = screen.getByText('This is a test description for the video content.')

    expect(title).toHaveClass('text-2xl', 'md:text-3xl', 'lg:text-4xl')
    expect(description).toHaveClass('text-lg', 'md:text-xl')
  })

  it('has proper layout and spacing', () => {
    render(<OverlayMeta video={mockVideo} watchUrl={watchUrl} />)

    const overlay = screen.getByText('Test Movie Title').parentElement?.parentElement

    expect(overlay).toHaveClass(
      'absolute', 'inset-0', 'flex', 'flex-col', 'justify-end',
      'p-6', 'md:p-8', 'lg:p-12'
    )
  })

  it('truncates long descriptions with line-clamp', () => {
    const longDescriptionVideo = {
      ...mockVideo,
      description: 'This is a very long description that should be truncated because it exceeds the maximum number of lines that should be displayed in the overlay. It contains multiple sentences and should demonstrate the line clamping functionality.'
    }

    render(<OverlayMeta video={longDescriptionVideo} watchUrl={watchUrl} />)

    const description = screen.getByText(/This is a very long description/)
    expect(description).toHaveClass('line-clamp-3')
  })
})
