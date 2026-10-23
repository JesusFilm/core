import { getComponentType } from './mediaComponentType'

describe('getComponentType', () => {
  it('is content when the Variant has a stream URL', () => {
    expect(getComponentType('https://example.com/video.m3u8')).toBe('content')
  })

  it('is a container for a generated parent Variant with an empty hls', () => {
    expect(getComponentType('')).toBe('container')
  })

  it('is a container when there is no Variant or no hls', () => {
    expect(getComponentType(null)).toBe('container')
    expect(getComponentType(undefined)).toBe('container')
  })
})
