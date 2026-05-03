import { render, screen } from '@testing-library/react'

import { TemplateGalleryMedia } from './TemplateGalleryMedia'

describe('TemplateGalleryMedia', () => {
  it('renders an iframe for a YouTube URL', () => {
    render(
      <TemplateGalleryMedia
        mediaUrl="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        title="Easter Gallery"
      />
    )
    const iframe = screen.getByTitle('Easter Gallery')
    expect(iframe).toHaveAttribute(
      'src',
      'https://www.youtube.com/embed/dQw4w9WgXcQ'
    )
    expect(iframe).toHaveAttribute('loading', 'lazy')
  })

  it('renders an iframe for a Loom URL', () => {
    render(
      <TemplateGalleryMedia
        mediaUrl="https://www.loom.com/share/abcd1234"
        title="Easter Gallery"
      />
    )
    expect(screen.getByTitle('Easter Gallery')).toHaveAttribute(
      'src',
      'https://www.loom.com/embed/abcd1234'
    )
  })

  it('renders nothing when mediaUrl is null', () => {
    const { container } = render(
      <TemplateGalleryMedia mediaUrl={null} title="x" />
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing when mediaUrl is unsupported', () => {
    const { container } = render(
      <TemplateGalleryMedia
        mediaUrl="https://vimeo.com/12345"
        title="x"
      />
    )
    expect(container).toBeEmptyDOMElement()
  })
})
