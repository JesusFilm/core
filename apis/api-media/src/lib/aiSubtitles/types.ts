export type LanguageClass = 'LTR' | 'RTL' | 'CJK'

export interface SubtitleSegment {
  id: string
  start: number
  end: number
  text: string
}

export interface LanguageProfile {
  targetCPS: number
  maxCPS: number
  targetCPL: number
  maxCPL: number
  maxLines: number
  minDuration: number
  maxDuration: number
  startOffsetMs: number
  endOffsetMs: number
  minGapMs: number
  languageProfileVersion: 'v1'
}

export interface SubtitleAIInput {
  assetId: string
  bcp47: string
  languageClass: LanguageClass
  profile: LanguageProfile
  segments: SubtitleSegment[]
  promptVersion: 'v1'
}

export interface Cue {
  start: number
  end: number
  text: string
}

export interface ValidationErrorDetail {
  cueIndex: number
  rule:
    | 'INVALID_WEBVTT'
    | 'EMPTY_CUE'
    | 'INVALID_TIMESTAMP'
    | 'NON_MONOTONIC'
    | 'OVERLAP'
    | 'MIN_GAP'
    | 'MAX_LINES'
    | 'MAX_CPL'
    | 'MAX_CPS'
    | 'MIN_DURATION'
    | 'MAX_DURATION'
    | 'DISALLOWED_MARKUP'
  measured?: number
  limit?: number
  message: string
}

export interface ValidationResult {
  valid: boolean
  cues: Cue[]
  errors: ValidationErrorDetail[]
}

export interface PostProcessDebugArtifacts {
  sourceTranscriptVtt?: string
  transcriptUrl?: string
  storyboardUrl?: string
  aiAttempts?: {
    vtt: string
    errors: ValidationErrorDetail[]
  }[]
}

export interface PostProcessMetadata {
  languageClass: LanguageClass
  languageProfileVersion: 'v1'
  promptVersion: 'v1'
  validatorVersion: 'v1'
  fallbackVersion: 'v1'
  whisperSegmentsSha256: string
  postProcessInputSha256: string
  aiPostProcessed: boolean
  fallbackUsed: boolean
}

export interface PostProcessResult {
  vtt: string
  metadata: PostProcessMetadata
  validation: ValidationResult
  debugArtifacts?: PostProcessDebugArtifacts
}
