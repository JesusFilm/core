import { type VideoContent } from '../VideoTypes'

export interface TimedText {
  text: string
  duration: number // in seconds
}

export interface VideoVerseProps {
  video: VideoContent
  onPlayPause: (video: VideoContent) => void
  isPlaying: boolean
  videoRef:
    | React.RefObject<HTMLVideoElement>
    | ((el: HTMLVideoElement | null) => void)
  verse: TimedText[]
}
