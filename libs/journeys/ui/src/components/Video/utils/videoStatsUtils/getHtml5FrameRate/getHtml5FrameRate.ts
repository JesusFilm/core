import VideoJsPlayer from '../../../utils/videoJsTypes'

/**
 * Gets the current frame rate of the HTML5 video
 * @param player The video.js player instance
 * @returns The frame rate as a number or a string message if not available
 */
export function getHtml5FrameRate(player: VideoJsPlayer): string | number {
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
