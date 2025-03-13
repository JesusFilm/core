import Tech from 'video.js/dist/types/tech/tech'

// From `videojs-youtube`
// extend based of docs as needed
// https://www.npmjs.com/package/videojs-youtube/v/3.0.1

export interface YoutubeTech extends Tech {
  ytPlayer: {
    getPlaybackQuality: () => string
    getAvailableQualityLevels: () => string[]
    getVideoLoadedFraction: () => number
  }
}
