import { render } from '@testing-library/react'
import { ArrowNav } from './ArrowNav'
import { Bullets } from './Bullets'
import { MuteToggle } from './MuteToggle'
import { OverlayMeta } from './OverlayMeta'
import { CarouselVideoItem } from '@/server/getCarouselVideos'

// Mock Next.js Link component for OverlayMeta
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props} data-testid="link">
      {children}
    </a>
  )
}))

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

describe('Component Snapshots', () => {
  it('ArrowNav matches snapshot', () => {
    const { container } = render(
      <ArrowNav onPrev={() => {}} onNext={() => {}} />
    )
    expect(container.firstChild).toMatchSnapshot()
  })

  it('Bullets matches snapshot', () => {
    const { container } = render(
      <Bullets
        total={2}
        activeIndex={0}
        progress={7.5} // Half of 15 seconds
        onBulletClick={() => {}}
        onPlayPause={() => {}}
        isPlaying={true}
      />
    )
    expect(container.firstChild).toMatchSnapshot()
  })

  it('MuteToggle matches snapshot when muted', () => {
    const { container } = render(
      <MuteToggle isMuted={true} onToggle={() => {}} />
    )
    expect(container.firstChild).toMatchSnapshot()
  })

  it('MuteToggle matches snapshot when unmuted', () => {
    const { container } = render(
      <MuteToggle isMuted={false} onToggle={() => {}} />
    )
    expect(container.firstChild).toMatchSnapshot()
  })

  it('OverlayMeta matches snapshot', () => {
    const { container } = render(
      <OverlayMeta video={mockVideo} watchUrl={watchUrl} />
    )
    expect(container.firstChild).toMatchSnapshot()
  })
})
