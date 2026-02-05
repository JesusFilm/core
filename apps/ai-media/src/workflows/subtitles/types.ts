import type { SubtitleFile, UploadSubtitlesResult } from '@mux/ai/primitives'

export type SubtitlesWorkflowInput = {
  assetId: string
  playbackId: string
  language?: string
  format?: SubtitleFile['format']
  requestId: string
}

export type SubtitlesWorkflowResult = {
  generated: SubtitleFile
  improved: SubtitleFile
  upload: UploadSubtitlesResult
}
