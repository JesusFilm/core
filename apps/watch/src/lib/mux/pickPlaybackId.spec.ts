import { pickPlaybackId } from './pickPlaybackId'

describe('pickPlaybackId', () => {
  it('returns deterministic playback ID when seed is provided', () => {
    const ids = ['first', 'second', 'third']

    const first = pickPlaybackId(ids, { seed: 'session-123' })
    const second = pickPlaybackId(ids, { seed: 'session-123' })

    expect(first).toEqual(second)
  })

  it('uses custom random function when provided', () => {
    const ids = ['first', 'second', 'third']

    const result = pickPlaybackId(ids, { random: () => 0.9 })

    expect(result).toEqual({ playbackId: 'third', index: 2 })
  })

  it('throws when no playback IDs are provided', () => {
    expect(() => pickPlaybackId([], { seed: 'empty' })).toThrow(
      'Cannot pick from an empty collection'
    )
  })
})
