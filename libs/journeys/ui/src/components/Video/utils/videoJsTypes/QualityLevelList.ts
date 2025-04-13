import EventTarget from 'video.js/dist/types/event-target'

// Types for `videojs-contrib-quality-levels`
// Based off `types/videojs-contrib-quality-levels`
// Using the library wasn't applying the types correctly :(
// https://www.npmjs.com/package/@types/videojs-contrib-quality-levels

export interface QualityLevelList extends EventTarget {
  selectedIndex: number
  length: number
  [index: number]: QualityLevel
  addQualityLevel(representation: Representation): QualityLevel
  removeQualityLevel(representation: Representation): QualityLevel | null
  getQualityLevelById(id: string): QualityLevel | null
  dispose(): void
}

interface Representation {
  id: string
  width?: number | undefined
  height?: number | undefined
  bandwidth: number
  enabled: {
    (enabled: boolean): void
    (): boolean
  }
}

interface QualityLevel {
  id: string
  label: string
  width: number
  height: number
  bitrate: number
  enabled: boolean
}
