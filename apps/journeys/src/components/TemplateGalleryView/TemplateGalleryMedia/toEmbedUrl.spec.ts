import { toEmbedUrl } from './toEmbedUrl'

describe('toEmbedUrl', () => {
  it.each([
    [
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      'https://www.youtube.com/embed/dQw4w9WgXcQ'
    ],
    [
      'https://youtube.com/watch?v=dQw4w9WgXcQ',
      'https://www.youtube.com/embed/dQw4w9WgXcQ'
    ],
    [
      'https://youtu.be/dQw4w9WgXcQ',
      'https://www.youtube.com/embed/dQw4w9WgXcQ'
    ],
    [
      'http://youtu.be/dQw4w9WgXcQ',
      'https://www.youtube.com/embed/dQw4w9WgXcQ'
    ],
    [
      'https://www.loom.com/share/abc123def456',
      'https://www.loom.com/embed/abc123def456'
    ],
    [
      'https://loom.com/share/abc123def456',
      'https://www.loom.com/embed/abc123def456'
    ]
  ])('rewrites %s to %s', (input, expected) => {
    expect(toEmbedUrl(input)).toBe(expected)
  })

  it.each([
    'https://vimeo.com/12345',
    'https://example.com/video.mp4',
    'not a url',
    ''
  ])('returns null for %s', (input) => {
    expect(toEmbedUrl(input)).toBeNull()
  })
})
