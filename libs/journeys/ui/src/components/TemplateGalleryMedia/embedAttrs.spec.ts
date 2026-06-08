import { KNOWN_EMBED_HOSTS, embedAttrs } from './embedAttrs'

describe('embedAttrs', () => {
  it('returns YouTube config for youtube-nocookie host', () => {
    const attrs = embedAttrs('https://www.youtube-nocookie.com/embed/abc123')
    expect(attrs?.allow).toContain('picture-in-picture')
    expect(attrs?.allow).toContain('encrypted-media')
    expect(attrs?.allowFullScreen).toBe(true)
    expect(attrs?.referrerPolicy).toBe('strict-origin-when-cross-origin')
    expect(attrs?.sandbox).toContain('allow-presentation')
    expect(attrs?.aspectRatioPaddingTop).toBe('56.25%')
  })

  it('returns Canva config for canva.com host', () => {
    const attrs = embedAttrs('https://www.canva.com/design/DA123/view?embed')
    expect(attrs?.allow).toBe('fullscreen')
    expect(attrs?.allowFullScreen).toBe(true)
    expect(attrs?.referrerPolicy).toBeUndefined()
    expect(attrs?.sandbox).toContain('allow-forms')
    expect(attrs?.aspectRatioPaddingTop).toBe('56.2225%')
  })

  it('returns Slides config for docs.google.com host', () => {
    const attrs = embedAttrs('https://docs.google.com/presentation/d/123/embed')
    expect(attrs?.allow).toBe('fullscreen')
    expect(attrs?.allowFullScreen).toBe(true)
    expect(attrs?.aspectRatioPaddingTop).toBe('56.2225%')
    // Slides does not need Canva's allow-forms token.
    expect(attrs?.sandbox).not.toContain('allow-forms')
  })

  it('renders an unknown https host with a script-isolated default (no allow-same-origin)', () => {
    const attrs = embedAttrs('https://example.com/whatever')
    expect(attrs).not.toBeNull()
    expect(attrs?.allow).toBe('')
    expect(attrs?.allowFullScreen).toBe(false)
    expect(attrs?.sandbox).toBe('allow-scripts')
    expect(attrs?.sandbox).not.toContain('allow-same-origin')
    expect(attrs?.aspectRatioPaddingTop).toBe('56.25%')
  })

  it('returns null for an unparseable URL', () => {
    expect(embedAttrs('not-a-url')).toBeNull()
  })

  it('returns null for non-https schemes', () => {
    expect(embedAttrs('http://www.youtube-nocookie.com/embed/abc')).toBeNull()
    expect(embedAttrs('javascript:alert(1)')).toBeNull()
    expect(embedAttrs('data:text/html,<script>alert(1)</script>')).toBeNull()
  })

  it('exposes the tuned hosts as KNOWN_EMBED_HOSTS', () => {
    expect(KNOWN_EMBED_HOSTS.has('www.youtube-nocookie.com')).toBe(true)
    expect(KNOWN_EMBED_HOSTS.has('canva.com')).toBe(true)
    expect(KNOWN_EMBED_HOSTS.has('docs.google.com')).toBe(true)
    expect(KNOWN_EMBED_HOSTS.has('example.com')).toBe(false)
  })
})
