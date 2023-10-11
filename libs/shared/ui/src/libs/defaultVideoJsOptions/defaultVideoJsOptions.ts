// note: all video.js players import these options, so take care with what is added here

export const defaultVideoJsOptions = {
  html5: {
    hls: {
      useDevicePixelRatio: true,
      bandwidth: 1e9 // used to set initial bandwidth before calculation for abr video
    }
  }
}
