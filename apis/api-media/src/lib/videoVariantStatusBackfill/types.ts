export type ProcessingStageState =
  | 'pending'
  | 'processing'
  | 'complete'
  | 'failed'
  | 'unknown'
  | 'notApplicable'

export type ProcessingStage = {
  state: ProcessingStageState
  attempts: number
  error?: string
  lastAttemptAt?: string
  lastSuccessAt?: string
}

export type ProcessingStages = {
  mux: ProcessingStage
  parentSync: ProcessingStage
  downloads: ProcessingStage
  algoliaVideo: ProcessingStage
  algoliaVariant: ProcessingStage
}

export type VideoVariantProcessingStatus = 'degraded' | 'complete' | 'failed'

export type VideoVariantForClassification = {
  id: string
  videoId: string
  languageId: string
  edition: string
  version: number
  published: boolean
  hls: string | null
  dash: string | null
  share: string | null
  masterUrl: string | null
  duration: number | null
  muxVideoId: string | null
  assetId: string | null
  brightcoveId: string | null
  downloadable: boolean
  // An array, not a count, so this shape matches videoVariantContainsMedia's
  // expected input exactly -- it checks `downloads.length`, and this way
  // callers never have to keep a derived count in sync with the real rows.
  downloads: Array<{ id: string }>
  muxVideoReadyToStream: boolean | null
}

export type ParentVideoForClassification = {
  id: string
  availableLanguages: string[]
}

export type VideoForClassification = {
  id: string
  childIds: string[]
  availableLanguages: string[]
}

export type VideoVariantClassification = {
  isGeneratedParentVariant: boolean
  hasUsableMedia: boolean
  stages: ProcessingStages
  processingStatus: VideoVariantProcessingStatus
}
