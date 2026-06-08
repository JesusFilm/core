import { render, screen } from '@testing-library/react'

import { JourneyViewMedia } from './JourneyViewMedia'

// Mock video.js so the player lifecycle (init + dispose) is observable. The
// <source> element is plain React JSX, so it still renders for the source-URL
// assertions below even with the player mocked.
const { videojsMock, disposeMock } = vi.hoisted(() => {
  const disposeMock = vi.fn()
  const videojsMock = vi.fn(() => ({ dispose: disposeMock }))
  return { videojsMock, disposeMock }
})
vi.mock('video.js', () => ({ default: videojsMock }))

describe('JourneyViewMedia', () => {
  beforeEach(() => {
    videojsMock.mockClear()
    disposeMock.mockClear()
  })

  it('renders a YouTube iframe with host-specific allow, referrerPolicy and sandbox', () => {
    render(
      <JourneyViewMedia
        media={{
          type: 'link',
          embedUrl: 'https://www.youtube-nocookie.com/embed/abc123'
        }}
      />
    )
    const iframe = screen.getByTestId('TemplateGalleryMediaIframe')
    expect(iframe).toHaveAttribute(
      'src',
      'https://www.youtube-nocookie.com/embed/abc123'
    )
    expect(iframe.getAttribute('allow')).toContain('picture-in-picture')
    expect(iframe).toHaveAttribute(
      'referrerpolicy',
      'strict-origin-when-cross-origin'
    )
    expect(iframe.getAttribute('sandbox')).toContain('allow-presentation')
  })

  it('renders a Canva iframe with fullscreen allow and Canva sandbox', () => {
    render(
      <JourneyViewMedia
        media={{
          type: 'link',
          embedUrl: 'https://www.canva.com/design/DA/view?embed'
        }}
      />
    )
    const iframe = screen.getByTestId('TemplateGalleryMediaIframe')
    expect(iframe).toHaveAttribute('allow', 'fullscreen')
    expect(iframe.getAttribute('sandbox')).toContain('allow-forms')
  })

  it('renders a Google Slides iframe through the link branch', () => {
    render(
      <JourneyViewMedia
        media={{
          type: 'link',
          embedUrl: 'https://docs.google.com/presentation/d/1/embed'
        }}
      />
    )
    const iframe = screen.getByTestId('TemplateGalleryMediaIframe')
    expect(iframe).toHaveAttribute(
      'src',
      'https://docs.google.com/presentation/d/1/embed'
    )
    // Slides does not get Canva's allow-forms token.
    expect(iframe.getAttribute('sandbox')).not.toContain('allow-forms')
  })

  it('renders nothing for a non-https or off-allowlist link embed', () => {
    const { container } = render(
      <JourneyViewMedia
        media={{ type: 'link', embedUrl: 'javascript:alert(1)' }}
      />
    )
    expect(
      screen.queryByTestId('TemplateGalleryMediaIframe')
    ).not.toBeInTheDocument()
    expect(container).toBeEmptyDOMElement()
  })

  it('renders a Mux video.js player sourced from stream.mux.com', () => {
    render(
      <JourneyViewMedia media={{ type: 'mux', muxPlaybackId: 'playback123' }} />
    )
    expect(
      screen.getByTestId('TemplateGalleryMedia').querySelector('source')
    ).toHaveAttribute('src', 'https://stream.mux.com/playback123.m3u8')
    expect(videojsMock).toHaveBeenCalledTimes(1)
  })

  it('renders nothing for a malformed Mux playback id', () => {
    const { container } = render(
      <JourneyViewMedia media={{ type: 'mux', muxPlaybackId: 'bad/../id' }} />
    )
    expect(container).toBeEmptyDOMElement()
    expect(videojsMock).not.toHaveBeenCalled()
  })

  it('disposes the player on unmount', () => {
    const { unmount } = render(
      <JourneyViewMedia media={{ type: 'mux', muxPlaybackId: 'playback123' }} />
    )
    expect(disposeMock).not.toHaveBeenCalled()
    unmount()
    expect(disposeMock).toHaveBeenCalledTimes(1)
  })

  it('remounts the player when the playback id changes (no stale stream)', () => {
    const { rerender } = render(
      <JourneyViewMedia media={{ type: 'mux', muxPlaybackId: 'first00' }} />
    )
    expect(videojsMock).toHaveBeenCalledTimes(1)
    rerender(
      <JourneyViewMedia media={{ type: 'mux', muxPlaybackId: 'second00' }} />
    )
    // key={playbackId} forces unmount+remount: old player disposed, new inited.
    expect(disposeMock).toHaveBeenCalledTimes(1)
    expect(videojsMock).toHaveBeenCalledTimes(2)
    expect(
      screen.getByTestId('TemplateGalleryMedia').querySelector('source')
    ).toHaveAttribute('src', 'https://stream.mux.com/second00.m3u8')
  })

  it('renders nothing when media is null (legacy row)', () => {
    const { container } = render(<JourneyViewMedia media={null} />)
    expect(container).toBeEmptyDOMElement()
  })
})
