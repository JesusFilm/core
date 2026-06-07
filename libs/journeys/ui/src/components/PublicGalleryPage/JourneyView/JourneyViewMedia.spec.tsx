import { render, screen } from '@testing-library/react'

import { JourneyViewMedia } from './JourneyViewMedia'

describe('JourneyViewMedia', () => {
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

  it('renders a Mux video.js player sourced from stream.mux.com', () => {
    render(
      <JourneyViewMedia media={{ type: 'mux', muxPlaybackId: 'playback123' }} />
    )
    expect(
      screen.getByTestId('TemplateGalleryMedia').querySelector('source')
    ).toHaveAttribute('src', 'https://stream.mux.com/playback123.m3u8')
  })

  it('renders nothing when media is null (legacy row)', () => {
    const { container } = render(<JourneyViewMedia media={null} />)
    expect(container).toBeEmptyDOMElement()
  })
})
