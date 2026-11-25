import Tech from 'video.js/dist/types/tech/tech'

// From `videojs-youtube`
// extend based of docs as needed
// https://www.npmjs.com/package/videojs-youtube/v/3.0.1

export interface YoutubeCaptionLanguages {
  displayName: string
  id: string | null
  is_default: boolean
  is_servable: boolean
  is_translateable: boolean
  kind: string
  languageCode: string
  languageName: string
  name: string
  vss_id: string
}

export interface YoutubeTech extends Tech {
  ytPlayer: {
    getOption?: (category: string, name: string) => YoutubeCaptionLanguages[]
    // Names of the modules currently loaded, e.g. ['captions']
    getOptions?: () => string[]
    addEventListener?: (event: string, listener: () => void) => void
    removeEventListener?: (event: string, listener: () => void) => void
    getPlaybackQuality: () => string
    getAvailableQualityLevels: () => string[]
    getVideoLoadedFraction: () => number
    loadModule?: (module: string) => void
    unloadModule?: (module: string) => void
    setOption?: (category: string, name: string, value: any) => void
  }
}
