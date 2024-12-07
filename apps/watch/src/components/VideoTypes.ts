export enum VideoType {
  VERTICAL_CLIP = 'VERTICAL_CLIP',
  HORIZONTAL_CLIP = 'HORIZONTAL_CLIP',
  VIDEO_VERSE = 'VIDEO_VERSE'
}

export interface VideoContent {
  id: string
  type: VideoType
  src: string
  poster?: string
  title?: string
  description?: string
  verse?: {
    text: string
    reference: string
  }
}
