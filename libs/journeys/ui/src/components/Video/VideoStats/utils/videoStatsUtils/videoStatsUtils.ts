import Player from 'video.js/dist/types/player'

export function formatTimeRanges(timeRanges?: TimeRanges | null): string {
  if (!timeRanges) return '-'

  const ranges = []
  for (let i = 0; i < timeRanges.length; i++) {
    ranges.push(
      `${formatTime(timeRanges.start(i))}-${formatTime(timeRanges.end(i))}`
    )
  }
  return ranges.join(', ')
}

export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export function getCurrentQuality(): string {
  const videoEl = document.querySelector('video')
  if (!videoEl) return ''

  const width = videoEl.videoWidth
  const height = videoEl.videoHeight
  return width && height ? `${width}x${height}` : ''
}

export function getLiveFrameRate(player: Player): string | number {
  const videoEl = player.el().querySelector('video')
  if (!videoEl) return 'No video element'

  const time = player.currentTime() || 0
  if (time <= 0) return 'Buffering...'

  // Try different methods to get frame rate in order of preference
  if ('getVideoPlaybackQuality' in videoEl) {
    const quality = (videoEl as any).getVideoPlaybackQuality()
    const frames = quality?.totalVideoFrames
    if (frames > 0) return Math.round(frames / time)
  }

  if ('webkitDecodedFrameCount' in videoEl) {
    const frames = (videoEl as any).webkitDecodedFrameCount
    if (frames > 0) return Math.round(frames / time)
  }

  if ('mozParsedFrames' in videoEl) {
    const frames = (videoEl as any).mozParsedFrames
    if (frames > 0) return Math.round(frames / time)
  }

  return 'Not available'
}
