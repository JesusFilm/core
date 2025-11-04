import VideoJsPlayer from '../videoJsTypes'

export function hideAllSubtitles(player: VideoJsPlayer): void {
  const tracks = player.textTracks?.() ?? new TextTrackList()
  for (let i = 0; i < tracks.length; i++) {
    const track = tracks[i]
    if (track.kind === 'subtitles' || track.kind === 'captions') {
      track.mode = 'hidden'
    }
  }
}
