import { previewEmbedUrl } from './previewEmbedUrl'

describe('previewEmbedUrl', () => {
  it('normalizes the common YouTube shapes to a nocookie embed', () => {
    expect(previewEmbedUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(
      'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'
    )
    expect(previewEmbedUrl('https://youtu.be/dQw4w9WgXcQ')).toBe(
      'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'
    )
    expect(previewEmbedUrl('https://www.youtube.com/shorts/dQw4w9WgXcQ')).toBe(
      'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'
    )
    expect(previewEmbedUrl('https://m.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(
      'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'
    )
  })

  it('passes through an already-normalized nocookie embed', () => {
    expect(
      previewEmbedUrl('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ')
    ).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ')
  })

  it('returns null for Canva / Slides / unknown hosts that need server normalization', () => {
    expect(previewEmbedUrl('https://www.canva.com/design/DA/view')).toBeNull()
    expect(
      previewEmbedUrl('https://docs.google.com/presentation/d/1/edit')
    ).toBeNull()
    expect(previewEmbedUrl('https://example.com/whatever')).toBeNull()
  })

  it('returns null for empty, non-https, or unparseable input', () => {
    expect(previewEmbedUrl('')).toBeNull()
    expect(previewEmbedUrl('   ')).toBeNull()
    expect(previewEmbedUrl('http://www.youtube.com/watch?v=abc')).toBeNull()
    expect(previewEmbedUrl('not a url')).toBeNull()
  })

  it('returns null for YouTube URLs that are not a single video', () => {
    // youtu.be/playlist and /channel paths must not be mistaken for a video id.
    expect(previewEmbedUrl('https://youtu.be/playlist?list=PL123')).toBeNull()
    expect(previewEmbedUrl('https://www.youtube.com/channel/UCabc')).toBeNull()
    expect(
      previewEmbedUrl('https://www.youtube.com/watch?v=tooshort')
    ).toBeNull()
  })

  it('re-validates the id on the nocookie passthrough', () => {
    expect(
      previewEmbedUrl('https://www.youtube-nocookie.com/embed/')
    ).toBeNull()
    expect(
      previewEmbedUrl('https://www.youtube-nocookie.com/embed/playlist?list=PL')
    ).toBeNull()
  })

  it('rejects the canonical URL-allowlist bypass payloads', () => {
    // javascript:/data: schemes, and a credential-prefixed look-alike host
    // that actually resolves to an attacker domain.
    expect(previewEmbedUrl('javascript:alert(1)//youtube.com')).toBeNull()
    expect(
      previewEmbedUrl('data:text/html,<script>alert(1)</script>')
    ).toBeNull()
    expect(
      previewEmbedUrl('https://www.youtube.com@evil.example/watch?v=dQw4w9WgXcQ')
    ).toBeNull()
  })
})
