import { videoJsOptions } from './videoJsOptions'

describe('videoJsOptions', () => {
  it('should have useDevicePixelRatio set to true', () => {
    expect(videoJsOptions.html5.hls.useDevicePixelRatio).toBe(true)
  })

  it('should have bandwidth set to 1e9', () => {
    expect(videoJsOptions.html5.hls.bandwidth).toBe(1e9)
  })
})
