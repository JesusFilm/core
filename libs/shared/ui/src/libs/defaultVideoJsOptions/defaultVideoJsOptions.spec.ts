import { defaultVideoJsOptions } from './defaultVideoJsOptions'

describe('defaultVideoJsOptions', () => {
  it('should have enableSmoothSeeking set to true', () => {
    expect(defaultVideoJsOptions.enableSmoothSeeking).toBe(true)
  })

  it('should have experimentalSvgIcons set to true', () => {
    expect(defaultVideoJsOptions.experimentalSvgIcons).toBe(true)
  })

  describe('hls', () => {
    it('should have useDevicePixelRatio set to true', () => {
      expect(defaultVideoJsOptions.html5.hls.useDevicePixelRatio).toBe(true)
    })

    it('should have bandwidth set to 1e9', () => {
      expect(defaultVideoJsOptions.html5.hls.bandwidth).toBe(1e9)
    })

    it('should have useBandwidthFromLocalStorage set to true', () => {
      expect(defaultVideoJsOptions.html5.hls.useBandwidthFromLocalStorage).toBe(
        true
      )
    })

    it('should have useNetworkInformationApi set to true', () => {
      expect(defaultVideoJsOptions.html5.hls.useNetworkInformationApi).toBe(
        true
      )
    })

    it('should have limitRenditionByPlayerDimensions set to false', () => {
      expect(
        defaultVideoJsOptions.html5.hls.limitRenditionByPlayerDimensions
      ).toBe(false)
    })
  })

  describe('vhs', () => {
    it('should have useDevicePixelRatio set to true', () => {
      expect(defaultVideoJsOptions.html5.vhs.useDevicePixelRatio).toBe(true)
    })

    it('should have bandwidth set to 1e9', () => {
      expect(defaultVideoJsOptions.html5.vhs.bandwidth).toBe(1e9)
    })

    it('should have useBandwidthFromLocalStorage set to true', () => {
      expect(defaultVideoJsOptions.html5.vhs.useBandwidthFromLocalStorage).toBe(
        true
      )
    })

    it('should have useNetworkInformationApi set to true', () => {
      expect(defaultVideoJsOptions.html5.vhs.useNetworkInformationApi).toBe(
        true
      )
    })

    it('should have limitRenditionByPlayerDimensions set to false', () => {
      expect(
        defaultVideoJsOptions.html5.vhs.limitRenditionByPlayerDimensions
      ).toBe(false)
    })
  })
})
