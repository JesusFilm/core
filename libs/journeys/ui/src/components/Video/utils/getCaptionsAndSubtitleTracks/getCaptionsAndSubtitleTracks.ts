import VideoJsPlayer from '../videoJsTypes'

/**
 * Gets text tracks that are subtitles and captions
 * @param player - The Video.js player instance
 * @returns Array of TextTrack objects that are subtitles or captions
 */
export function getCaptionsAndSubtitleTracks(
  player: VideoJsPlayer
): TextTrack[] {
  const tracks = player.textTracks?.() ?? new TextTrackList()
  const captionTracks: TextTrack[] = []

  for (let i = 0; i < tracks.length; i++) {
    const track = tracks[i]
    if (track.kind === 'subtitles' || track.kind === 'captions') {
      captionTracks.push(track)
    }
  }

  return captionTracks
}
