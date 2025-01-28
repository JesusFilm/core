interface VideoControlProps {
  player: Player
  isPlaying: boolean
  onPlayPause: () => void
  onVisibleChanged: (visible: boolean) => void
}

export function VideoControls({
  player,
  isPlaying,
  onPlayPause,
  onVisibleChanged
}: VideoControlProps) {
  // ... rest of the component implementation
}
