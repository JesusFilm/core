import { isValidMuxPlaybackId } from './muxPlaybackId'

describe('isValidMuxPlaybackId', () => {
  it('accepts URL-safe playback ids (letters, digits, - and _)', () => {
    expect(isValidMuxPlaybackId('AbC123xyz00')).toBe(true)
    expect(isValidMuxPlaybackId('pb-1')).toBe(true)
    expect(isValidMuxPlaybackId('a_b-C9')).toBe(true)
  })

  it('rejects empty or non-alphanumeric ids', () => {
    expect(isValidMuxPlaybackId('')).toBe(false)
    expect(isValidMuxPlaybackId('id with space')).toBe(false)
    expect(isValidMuxPlaybackId('id/../../etc')).toBe(false)
    expect(isValidMuxPlaybackId('id.m3u8?x=1')).toBe(false)
    expect(isValidMuxPlaybackId('id#frag')).toBe(false)
  })
})
