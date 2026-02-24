import { YoutubeTech } from '../videoJsTypes/YoutubeTech'

export function setYouTubeCaptionTrack(
  ytPlayer: YoutubeTech['ytPlayer'] | null,
  languageCode: string | undefined
): void {
  if (ytPlayer == null || languageCode == null) return
  ytPlayer.loadModule?.('captions')
  ytPlayer.setOption?.('captions', 'track', { languageCode })
}
