import { sendGTMEvent } from '@next/third-parties/google'

interface ImageSelectEvent {
  isAi: boolean
}

interface VideoSelectEvent {
  duration: number | null
}

export function sendImageSelectEvent({ isAi }: ImageSelectEvent): void {
  sendGTMEvent({
    event: 'image_select',
    isAi
  })
}

export function sendVideoSelectEvent({ duration }: VideoSelectEvent): void {
  sendGTMEvent({
    event: 'video_select',
    duration,
    videoSource: 'mux'
  })
}
