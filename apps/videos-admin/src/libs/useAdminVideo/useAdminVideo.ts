// Type definitions for video-related components
export type Language = {
  id: string
  name: {
    value: string
  }
}

export type VideoTranslation = {
  id: string
  value: string
  primary: boolean
  language: Language
}

export type GetAdminVideo_AdminVideo_VideoDescriptions = VideoTranslation[]
export type GetAdminVideo_AdminVideo_VideoSnippets = VideoTranslation[]
export type GetAdminVideo_AdminVideo_VideoImageAlts = VideoTranslation[]
export type GetAdminVideo_AdminVideo_VideoTitles = VideoTranslation[]

export type AdminVideo = {
  id: string
  label: string
  published: boolean
  slug: string
  title: GetAdminVideo_AdminVideo_VideoTitles
  description: GetAdminVideo_AdminVideo_VideoDescriptions
  snippet: GetAdminVideo_AdminVideo_VideoSnippets
  imageAlts: GetAdminVideo_AdminVideo_VideoImageAlts
}

// The mock is now in a separate file
