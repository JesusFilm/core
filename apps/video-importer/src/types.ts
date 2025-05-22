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
  }
}

export interface ProcessingSummary {
  total: number
  successful: number
  failed: number
  errors: Array<{ file: string; error: string }>
}

export interface VideoMetadata {
  durationMs: number
  duration: number
  width: number
  height: number
}

export interface VideoVariantInput {
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
  masterUrl: string
  masterHeight: number
  masterWidth: number
  lengthInMilliseconds: number
  duration: number
  version?: number
}

export interface GetLanguageSlugResponse {
  language: {
    id: string
    slug: string
  }
}

export interface GetVideoSlugResponse {
  video: {
    id: string
    slug: string
  }
}
