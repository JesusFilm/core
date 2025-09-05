import { VideoLabel } from '../../../../__generated__/globalTypes'

import { getWatchUrl } from './getWatchUrl'

describe('getWatchUrl', () => {
  it('should return correct URL for feature film with container slug and variant slug', () => {
    const result = getWatchUrl('movie-123', VideoLabel.featureFilm, 'en')
    expect(result).toBe('/watch/movie-123.html/en.html')
  })

  it('should return /watch for feature film without variant slug', () => {
    const result = getWatchUrl('movie-123', VideoLabel.featureFilm, undefined)
    expect(result).toBe('/watch')
  })

  it('should return correct URL for collection', () => {
    const result = getWatchUrl(
      'collection-123',
      VideoLabel.collection,
      'video-456/en'
    )
    expect(result).toBe('/watch/video-456.html/en.html')
  })

  it('should return correct URL for series', () => {
    const result = getWatchUrl('series-123', VideoLabel.series, 'video-456/en')
    expect(result).toBe('/watch/video-456.html/en.html')
  })

  it('should handle undefined container slug', () => {
    const result = getWatchUrl(
      undefined,
      VideoLabel.featureFilm,
      'video-456/en'
    )
    expect(result).toBe('/watch/video-456.html/en.html')
  })

  it('should handle undefined label', () => {
    const result = getWatchUrl('movie-123', undefined, 'video-456/en')
    expect(result).toBe('/watch/video-456.html/en.html')
  })

  it('should return /watch for undefined variant slug', () => {
    const result = getWatchUrl('movie-123', VideoLabel.featureFilm, undefined)
    expect(result).toBe('/watch')
  })

  it('should return /watch for all undefined inputs', () => {
    const result = getWatchUrl(undefined, undefined, undefined)
    expect(result).toBe('/watch')
  })

  it('should return /watch for empty variant slug', () => {
    const result = getWatchUrl(undefined, undefined, '')
    expect(result).toBe('/watch')
  })

  it('should return /watch for variant slug without language', () => {
    const result = getWatchUrl(undefined, undefined, 'video-456')
    expect(result).toBe('/watch')
  })
})
