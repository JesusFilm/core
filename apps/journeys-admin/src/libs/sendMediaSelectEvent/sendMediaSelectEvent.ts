import { sendGTMEvent } from '@next/third-parties/google'

interface ImageSelectEvent {
  isAi: boolean
}

export function sendImageSelectEvent({ isAi }: ImageSelectEvent): void {
  sendGTMEvent({
    event: 'image_select',
    isAi
  })
}

export function sendVideoSelectEvent(): void {
  sendGTMEvent({
    event: 'video_select',
    videoSource: 'mux'
  })
}
