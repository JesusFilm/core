import { buildPlaybackUrls } from './buildPlaybackUrls'

describe('buildPlaybackUrls', () => {
  it('builds expected URLs for a playback ID', () => {
    const urls = buildPlaybackUrls('abc123')

    expect(urls).toEqual({
      hls: 'https://stream.mux.com/abc123.m3u8',
      poster: 'https://image.mux.com/abc123/thumbnail.jpg?time=1',
      mp4: {
        medium: 'https://stream.mux.com/abc123/medium.mp4',
        high: 'https://stream.mux.com/abc123/high.mp4'
      }
    })
  })

  it('trims whitespace before building URLs', () => {
    const urls = buildPlaybackUrls('  trimmed  ')

    expect(urls.hls).toBe('https://stream.mux.com/trimmed.m3u8')
  })

  it('throws when playbackId is empty', () => {
    expect(() => buildPlaybackUrls('   ')).toThrow(
      'A playbackId is required to build URLs'
    )
  })
})
