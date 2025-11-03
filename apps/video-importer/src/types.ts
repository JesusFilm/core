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

export interface ProcessingSummary {
  total: number
  successful: number
  failed: number
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
