import { previewEmbedUrl } from './previewEmbedUrl'

describe('previewEmbedUrl', () => {
  it('normalizes the common YouTube shapes to a nocookie embed', () => {
    expect(previewEmbedUrl('https://www.youtube.com/watch?v=abc123')).toBe(
      'https://www.youtube-nocookie.com/embed/abc123'
    )
    expect(previewEmbedUrl('https://youtu.be/abc123')).toBe(
      'https://www.youtube-nocookie.com/embed/abc123'
    )
    expect(previewEmbedUrl('https://www.youtube.com/shorts/abc123')).toBe(
      'https://www.youtube-nocookie.com/embed/abc123'
    )
    expect(previewEmbedUrl('https://m.youtube.com/watch?v=abc123')).toBe(
      'https://www.youtube-nocookie.com/embed/abc123'
    )
  })

  it('passes through an already-normalized nocookie embed', () => {
    expect(
      previewEmbedUrl('https://www.youtube-nocookie.com/embed/abc123')
    ).toBe('https://www.youtube-nocookie.com/embed/abc123')
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
})
