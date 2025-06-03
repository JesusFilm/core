import {
  defaultBackgroundVideoJsOptions,
  defaultVideoJsOptions
} from './defaultVideoJsOptions'

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

describe('defaultBackgroundVideoJsOptions', () => {
  it('should have enableSmoothSeeking set to true', () => {
    expect(defaultBackgroundVideoJsOptions.enableSmoothSeeking).toBe(true)
  })

  it('should have experimentalSvgIcons set to true', () => {
    expect(defaultBackgroundVideoJsOptions.experimentalSvgIcons).toBe(true)
  })

  describe('hls', () => {
    it('should have useDevicePixelRatio set to true', () => {
      expect(
        defaultBackgroundVideoJsOptions.html5.hls.useDevicePixelRatio
      ).toBe(true)
    })

    it('should have useBandwidthFromLocalStorage set to true', () => {
      expect(
        defaultBackgroundVideoJsOptions.html5.hls.useBandwidthFromLocalStorage
      ).toBe(true)
    })

    it('should have useNetworkInformationApi set to true', () => {
      expect(
        defaultBackgroundVideoJsOptions.html5.hls.useNetworkInformationApi
      ).toBe(true)
    })

    it('should have limitRenditionByPlayerDimensions set to false', () => {
      expect(
        defaultBackgroundVideoJsOptions.html5.hls
          .limitRenditionByPlayerDimensions
      ).toBe(false)
    })
  })

  describe('vhs', () => {
    it('should have useDevicePixelRatio set to true', () => {
      expect(
        defaultBackgroundVideoJsOptions.html5.vhs.useDevicePixelRatio
      ).toBe(true)
    })

    it('should have useBandwidthFromLocalStorage set to true', () => {
      expect(
        defaultBackgroundVideoJsOptions.html5.vhs.useBandwidthFromLocalStorage
      ).toBe(true)
    })

    it('should have useNetworkInformationApi set to true', () => {
      expect(
        defaultBackgroundVideoJsOptions.html5.vhs.useNetworkInformationApi
      ).toBe(true)
    })

    it('should have limitRenditionByPlayerDimensions set to false', () => {
      expect(
        defaultBackgroundVideoJsOptions.html5.vhs
          .limitRenditionByPlayerDimensions
      ).toBe(false)
    })
  })

  it('should not have native track options', () => {
    expect(
      (defaultBackgroundVideoJsOptions.html5 as any).nativeAudioTracks
    ).toBeUndefined()
    expect(
      (defaultBackgroundVideoJsOptions.html5 as any).nativeVideoTracks
    ).toBeUndefined()
    expect(
      (defaultBackgroundVideoJsOptions.html5.vhs as any).overrideNative
    ).toBeUndefined()
  })
})
