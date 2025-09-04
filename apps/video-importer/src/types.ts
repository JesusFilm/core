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

export interface VideoVariantResponse {
  videoVariantCreate: {
    id: string
    videoId: string
    slug: string
    hls: string
    share: string
    published: boolean
    lengthInMilliseconds: number
    duration: number
    language: {
      id: string
      name: {
        value: string
        primary: boolean
      }
    }
  }
}

export interface VideoVariantUpdateResponse {
  videoVariantUpdate: {
    id: string
    videoId: string
    slug: string
    hls: string
    published: boolean
    lengthInMilliseconds: number
    duration: number
    share: string
    language: {
      id: string
      name: {
        value: string
        primary: boolean
      }
    }
  }
}

export interface ProcessingSummary {
  total: number
  successful: number
  failed: number
}

export interface VideoProcessingData {
  videoId: string
  languageId: string
  edition: string
  version: number
  metadata: any
  muxVideoId: string
  filePath: string
  fileName: string
}

export interface VideoMetadata {
  durationMs: number
  duration: number
  width: number
  height: number
}

export interface VideoVariantInput {
  existingVariantId: string | null
  id: string
  videoId: string
  edition: string
  languageId: string
  slug: string
  downloadable: boolean
  published: boolean
  muxVideoId: string
  hls: string
  share: string
  lengthInMilliseconds: number
  duration: number
  version?: number
}

export interface GetVideoDetailsForVariantUpsertResponse {
  video: {
    id: string
    slug: string
    variant: {
      id: string
      slug: string
    } | null
  }
  language: {
    id: string
    slug: string
  }
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
