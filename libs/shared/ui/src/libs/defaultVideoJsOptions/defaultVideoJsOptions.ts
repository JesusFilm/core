// note: all video.js players import these options, so take care with what is added here

export const defaultVideoJsOptions = {
  enableSmoothSeeking: true,
  experimentalSvgIcons: true,
  html5: {
    vhs: {
      limitRenditionByPlayerDimensions: false,
      useBandwidthFromLocalStorage: true,
      useNetworkInformationApi: true,
      useDevicePixelRatio: true
    },
    hls: {
      limitRenditionByPlayerDimensions: false,
      useBandwidthFromLocalStorage: true,
      useNetworkInformationApi: true,
      useDevicePixelRatio: true
    }
  }
}
