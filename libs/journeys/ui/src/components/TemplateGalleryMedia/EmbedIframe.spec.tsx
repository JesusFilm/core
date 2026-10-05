import { render, screen } from '@testing-library/react'

import { EmbedIframe } from './EmbedIframe'

describe('EmbedIframe', () => {
  it('renders an iframe with host-derived allow, referrerPolicy and sandbox', () => {
    render(
      <EmbedIframe
        embedUrl="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"
        title="Media"
        testId="Embed"
      />
    )
    const iframe = screen.getByTestId('EmbedIframe')
    expect(iframe).toHaveAttribute(
      'src',
      'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'
    )
    expect(iframe.getAttribute('allow')).toContain('picture-in-picture')
    expect(iframe).toHaveAttribute(
      'referrerpolicy',
      'strict-origin-when-cross-origin'
    )
    expect(iframe.getAttribute('sandbox')).toContain('allow-presentation')
  })

  it('applies the wrapper test id and a Canva sandbox', () => {
    render(
      <EmbedIframe
        embedUrl="https://www.canva.com/design/DA/view"
        title="Media"
        testId="Embed"
      />
    )
    expect(screen.getByTestId('Embed')).toBeInTheDocument()
    expect(screen.getByTestId('EmbedIframe').getAttribute('sandbox')).toContain(
      'allow-forms'
    )
  })
})
