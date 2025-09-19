// GraphQL-generated types for video data
export interface VideoTitle {
  value: string
}

export interface VideoDescription {
  value: string
}

export interface VideoImage {
  mobileCinematicHigh: string
}

export interface VideoLanguage {
  id: string
  bcp47: string
  name: Array<{
    value: string
    primary: boolean
  }>
}

export interface VideoDownload {
  quality: string
  size: number
  url: string
  height: number
  width: number
}

export interface VideoVariant {
  id: string
  hls: string | null
  duration: number | null
  downloadable: boolean
  downloads: VideoDownload[]
  language: VideoLanguage
}

export interface BibleCitation {
  bibleBook: {
    name: Array<{
      value: string
    }>
  }
  chapterStart: number
  chapterEnd: number | null
  verseStart: number
  verseEnd: number | null
}

export interface VideoStudyQuestion {
  value: string
}

export interface VideoData {
  id: string
  slug: string
  label: string
  title: VideoTitle[]
  description: VideoDescription[]
  images: VideoImage[]
  variant: VideoVariant | null
  availableLanguages: string[]
  variantLanguagesCount: number
  bibleCitations?: BibleCitation[]
  studyQuestions?: VideoStudyQuestion[]
}

// Search query types
export interface VideosFilter {
  title?: string
  labels?: string[]
  ids?: string[]
  published?: boolean
  availableVariantLanguageIds?: string[]
}

export interface SearchVideosQuery {
  videos: VideoData[]
}

export interface GetVideoQuery {
  video: VideoData
}