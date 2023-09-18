// note: all video.js players import these options, so take care with what is added here

export const videoJsOptions = {
  // overrideNative: true,
  // html5: {
  //   nativeAudioTracks: false,
  //   nativeVideoTracks: false
  // }
  hls: {
    //   // limitRenditionByPlayerDimensions: true,
    enableLowInitialPlaylist: false
    // capLevelToPlayerSize: false
  }
}
