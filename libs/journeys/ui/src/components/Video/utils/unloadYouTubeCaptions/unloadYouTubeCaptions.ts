import { YoutubeTech } from '../videoJsTypes/YoutubeTech'

export function unloadYouTubeCaptions(
  ytPlayer: YoutubeTech['ytPlayer'] | null
): void {
  if (ytPlayer == null) return
  ytPlayer.unloadModule?.('captions')
}
