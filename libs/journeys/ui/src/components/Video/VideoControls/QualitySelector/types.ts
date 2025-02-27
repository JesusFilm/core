declare module 'video.js' {
  interface Player {
    qualityLevels(): QualityLevelList
  }
}

interface QualityLevel {
  id: string
  width: number
  height: number
  bitrate: number
  enabled: boolean
}

interface QualityLevelList {
  length: number
  selectedIndex: number
  [index: number]: QualityLevel
  on(event: 'change' | 'addqualitylevel', callback: () => void): void
  off(event: 'change' | 'addqualitylevel', callback: () => void): void
}

export interface QualityOption {
  height: number
  bitrate: number
  label: string
  selected: boolean
}

export type { QualityLevel, QualityLevelList }
