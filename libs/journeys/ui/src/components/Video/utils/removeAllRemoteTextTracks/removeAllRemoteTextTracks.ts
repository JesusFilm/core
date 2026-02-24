import VideoJsPlayer from '../videoJsTypes'

export function removeAllRemoteTextTracks(player: VideoJsPlayer): void {
  const remoteTracks = player.remoteTextTracks?.()
  if (remoteTracks != null) {
    for (let i = remoteTracks.length - 1; i >= 0; i--) {
      const track = remoteTracks[i]
      if (track?.id != null) {
        player.removeRemoteTextTrack(track)
      }
    }
  }
}
