import { filterOutBlacklistedVideos, normalizeBlacklistedVideoIds } from './utils'

describe('normalizeBlacklistedVideoIds', () => {
  it('returns an empty array when value is undefined', () => {
    expect(normalizeBlacklistedVideoIds(undefined)).toEqual([])
  })

  it('filters out non-string entries and trims whitespace', () => {
    const input = [' video-1 ', 123, null, '']

    expect(normalizeBlacklistedVideoIds(input)).toEqual(['video-1'])
  })
})

describe('filterOutBlacklistedVideos', () => {
  it('returns videos unchanged when blacklist is empty', () => {
    const videos = [{ id: 'video-1' }, { id: 'video-2' }]

    expect(filterOutBlacklistedVideos(videos, new Set())).toEqual(videos)
  })

  it('filters videos whose IDs are in the blacklist', () => {
    const videos = [
      { id: 'video-1' },
      { id: 'video-2' },
      { id: 'video-3' }
    ]

    const result = filterOutBlacklistedVideos(videos, new Set(['video-2']))

    expect(result).toEqual([
      { id: 'video-1' },
      { id: 'video-3' }
    ])
  })

  it('ignores entries without an ID', () => {
    const videos = [{ id: 'video-1' }, { id: undefined } as any]

    expect(filterOutBlacklistedVideos(videos, new Set(['video-1']))).toEqual([])
  })
})
