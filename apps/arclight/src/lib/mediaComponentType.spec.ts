import { getComponentType } from './mediaComponentType'

describe('getComponentType', () => {
  it('is content when the Variant has an hls stream URL', () => {
    expect(getComponentType('https://example.com/video.m3u8', null)).toBe(
      'content'
    )
  })

  it('is content when the Variant has only a dash stream URL', () => {
    expect(getComponentType('', 'https://example.com/video.mpd')).toBe(
      'content'
    )
  })

  it('is a container for a generated parent Variant with empty hls and dash', () => {
    expect(getComponentType('', '')).toBe('container')
  })

  it('is a container when there is no Variant or no stream URLs', () => {
    expect(getComponentType(null, null)).toBe('container')
    expect(getComponentType(undefined, undefined)).toBe('container')
  })
})
