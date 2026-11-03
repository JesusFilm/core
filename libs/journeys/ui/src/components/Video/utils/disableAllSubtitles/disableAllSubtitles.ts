import VideoJsPlayer from '../videoJsTypes'

// Turns off every track a viewer could see as text on the video. Only
// metadata and chapters are left alone, so that non-standard kinds such as
// Safari's 'forced' HLS subtitles are switched off too.
export function disableAllSubtitles(player: VideoJsPlayer): void {
  const tracks = player.textTracks?.()
  if (tracks == null) return
  for (let i = 0; i < tracks.length; i++) {
    const track = tracks[i]
    if (track.kind === 'metadata' || track.kind === 'chapters') continue
    if (track.mode !== 'disabled') track.mode = 'disabled'
  }
}
