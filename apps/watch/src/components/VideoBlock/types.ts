import Player from 'video.js/dist/types/player'

export interface VideoBlockProps {
  setControlsVisible: (visible: boolean) => void
  contentId: string
  autoplay?: boolean
  muted?: boolean
  showControls?: boolean
  title?: string
  activeVideoId?: string | null
  onVideoPlay?: (videoId: string) => void
  onMuteToggle?: () => void
}
