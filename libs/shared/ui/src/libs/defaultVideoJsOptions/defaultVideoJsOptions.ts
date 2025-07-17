// note: all video.js players import these options, so take care with what is added here

export const defaultVideoJsOptions = {
  enableSmoothSeeking: true,
  experimentalSvgIcons: true,
  html5: {
    vhs: {
      limitRenditionByPlayerDimensions: false,
      useBandwidthFromLocalStorage: true,
      useNetworkInformationApi: true,
      useDevicePixelRatio: true,
      // allows vhs to be used in Safari - will not work for IOS
      overrideNative: true
    },
    // disable native audio and video tracks to force hls-supported browsers to use vjs
    nativeAudioTracks: false,
    nativeVideoTracks: false,
    hls: {
      limitRenditionByPlayerDimensions: false,
      useBandwidthFromLocalStorage: true,
      useNetworkInformationApi: true,
      useDevicePixelRatio: true
    }
  }
}

export const defaultBackgroundVideoJsOptions = {
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
