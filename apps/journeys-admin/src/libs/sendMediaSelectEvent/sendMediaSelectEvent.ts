import { sendGTMEvent } from '@next/third-parties/google'

interface ImageSelectEvent {
  imageId: string
  isAi: boolean
}

interface VideoSelectEvent {
  videoId: string
  duration: number | null
}

export function sendImageSelectEvent({
  imageId,
  isAi
}: ImageSelectEvent): void {
  sendGTMEvent({
    event: 'image_select',
    imageId,
    isAi
  })
}

export function sendVideoSelectEvent({
  videoId,
  duration
}: VideoSelectEvent): void {
  sendGTMEvent({
    event: 'video_select',
    videoId,
    duration,
    source: 'mux'
  })
}
