export interface MuxVideoResponse {
  createMuxVideoUploadByUrl: {
    id: string
    assetId: string
    playbackId: string
    readyToStream: boolean
  }
}

export interface MuxVideoStatusResponse {
  getMyMuxVideo: {
    id: string
    assetId: string
    playbackId: string
    readyToStream: boolean
  }
}

export interface ProcessingFailureDetail {
  file: string
  reason: string
}

export interface ProcessingSummary {
  total: number
  successful: number
  failed: number
  successfulFiles: string[]
  failedFiles: string[]
  failureDetails: ProcessingFailureDetail[]
}

export function createProcessingSummary(total: number): ProcessingSummary {
  return {
    total,
    successful: 0,
    failed: 0,
    successfulFiles: [],
    failedFiles: [],
    failureDetails: []
  }
}

export function recordProcessingFailure(
  summary: ProcessingSummary,
  file: string,
  reason: string
): void {
  const trimmed = reason.trim()
  summary.failed++
  summary.failedFiles.push(file)
  summary.failureDetails.push({
    file,
    reason: trimmed.length > 0 ? trimmed : 'Unknown error'
  })
}

export function recordProcessingSuccess(
  summary: ProcessingSummary,
  file: string
): void {
  summary.successful++
  summary.successfulFiles.push(file)
}

export interface VideoMetadata {
  durationMs: number
  duration: number
  width: number
  height: number
}

export interface R2Asset {
  publicUrl: string
  uploadUrl: string
  id?: string
}

export interface VideoSubtitleInput {
  id?: string
  videoId: string
  edition: string
  languageId: string
  vttSrc?: string
  srtSrc?: string
  vttAssetId?: string
  srtAssetId?: string
  vttVersion?: number
  srtVersion?: number
  primary?: boolean
}

export interface AudioPreviewInput {
  languageId: string
  value: string
  duration: number
  size: number
  bitrate: number
  codec: string
}
