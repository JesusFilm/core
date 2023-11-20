import { defaultVideoJsOptions } from './defaultVideoJsOptions'

describe('defaultVideoJsOptions', () => {
  it('should have useDevicePixelRatio set to true', () => {
    expect(defaultVideoJsOptions.html5.hls.useDevicePixelRatio).toBe(true)
  })

  it('should have bandwidth set to 1e9', () => {
    expect(defaultVideoJsOptions.html5.hls.bandwidth).toBe(1e9)
  })
})
