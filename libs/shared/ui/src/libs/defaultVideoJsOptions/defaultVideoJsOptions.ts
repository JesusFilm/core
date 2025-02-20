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
      // maxBufferLength: 30,
      // maxMaxBufferLength: 60,
      // initialBufferLength: 10
    },
    hls: {
      limitRenditionByPlayerDimensions: false,
      useBandwidthFromLocalStorage: true,
      useNetworkInformationApi: true,
      useDevicePixelRatio: true
      // maxBufferLength: 30,
      // maxMaxBufferLength: 60,
      // initialBufferLength: 10
    }
  }
}
