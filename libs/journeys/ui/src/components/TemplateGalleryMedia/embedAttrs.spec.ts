import { embedAttrs } from './embedAttrs'

describe('embedAttrs', () => {
  it('returns YouTube config for youtube-nocookie host', () => {
    const attrs = embedAttrs('https://www.youtube-nocookie.com/embed/abc123')
    expect(attrs.allow).toContain('picture-in-picture')
    expect(attrs.allow).toContain('encrypted-media')
    expect(attrs.allowFullScreen).toBe(true)
    expect(attrs.referrerPolicy).toBe('strict-origin-when-cross-origin')
    expect(attrs.sandbox).toContain('allow-presentation')
    expect(attrs.aspectRatioPaddingTop).toBe('56.25%')
  })

  it('returns Canva config for canva.com host', () => {
    const attrs = embedAttrs('https://www.canva.com/design/DA123/view?embed')
    expect(attrs.allow).toBe('fullscreen')
    expect(attrs.allowFullScreen).toBe(true)
    expect(attrs.referrerPolicy).toBeUndefined()
    expect(attrs.sandbox).toContain('allow-forms')
    expect(attrs.aspectRatioPaddingTop).toBe('56.2225%')
  })

  it('returns Slides config for docs.google.com host', () => {
    const attrs = embedAttrs(
      'https://docs.google.com/presentation/d/123/embed'
    )
    expect(attrs.allow).toBe('fullscreen')
    expect(attrs.allowFullScreen).toBe(true)
    expect(attrs.aspectRatioPaddingTop).toBe('56.2225%')
    // Slides does not need Canva's allow-forms token.
    expect(attrs.sandbox).not.toContain('allow-forms')
    expect(attrs.sandbox).toContain('allow-same-origin')
  })

  it('falls back to a restrictive default for an unknown host', () => {
    const attrs = embedAttrs('https://example.com/whatever')
    expect(attrs.allow).toBe('')
    expect(attrs.allowFullScreen).toBe(false)
    expect(attrs.sandbox).toBe('allow-scripts allow-same-origin')
    expect(attrs.aspectRatioPaddingTop).toBe('56.25%')
  })

  it('falls back to the restrictive default for an unparseable URL', () => {
    const attrs = embedAttrs('not-a-url')
    expect(attrs.allowFullScreen).toBe(false)
    expect(attrs.sandbox).toBe('allow-scripts allow-same-origin')
  })
})
