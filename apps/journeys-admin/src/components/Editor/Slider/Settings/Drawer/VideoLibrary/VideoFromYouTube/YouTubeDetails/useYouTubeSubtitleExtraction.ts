import { useEffect, useRef, useState } from 'react'
import videojs from 'video.js'
import Player from 'video.js/dist/types/player'

import { defaultVideoJsOptions } from '@core/shared/ui/defaultVideoJsOptions'

import { SubtitleTrack } from '../../VideoSubtitleProvider'

interface UseYouTubeSubtitleExtractionProps {
  videoId: string
  videoRef: React.RefObject<HTMLVideoElement | null>
  enabled: boolean
  onSubtitlesExtracted: (tracks: SubtitleTrack[]) => void
}

interface UseYouTubeSubtitleExtractionReturn {
  subtitlesLoading: boolean
  subtitleTracks: SubtitleTrack[]
}

/**
 * Hook to extract YouTube subtitle tracks using a hidden video player.
 *
 * This hook creates a hidden, muted, auto-playing video player that loads
 * the YouTube video with captions enabled. Once the video starts playing,
 * it extracts the available subtitle tracks from the YouTube player API
 * and cleans up the hidden player.
 *
 * @param videoId - YouTube video ID
 * @param videoRef - Ref to the hidden video element
 * @param enabled - Whether subtitle extraction should be enabled
 * @param onSubtitlesExtracted - Callback when subtitles are successfully extracted
 * @returns Object containing loading state and extracted subtitle tracks
 */
export function useYouTubeSubtitleExtraction({
  videoId,
  videoRef,
  enabled,
  onSubtitlesExtracted
}: UseYouTubeSubtitleExtractionProps): UseYouTubeSubtitleExtractionReturn {
  const playerRef = useRef<Player | null>(null)
  const extractionAttempted = useRef(false)
  const [subtitlesLoading, setSubtitlesLoading] = useState(true)
  const [subtitleTracks, setSubtitleTracks] = useState<SubtitleTrack[]>([])

  useEffect(() => {
    if (videoRef.current == null || !enabled) return

    setSubtitlesLoading(true)
    extractionAttempted.current = false

    // Create hidden player with autoplay and captions enabled
    playerRef.current = videojs(videoRef.current, {
      ...defaultVideoJsOptions,
      fluid: true,
      controls: false,
      muted: true,
      autoplay: true,
      youtube: {
        cc_load_policy: 1,
        cc_lang_pref: 'en'
      }
    })

    const extractSubtitles = (): void => {
      if (extractionAttempted.current) return
      extractionAttempted.current = true

      try {
        const ytPlayer = (playerRef.current?.tech_ as any)?.ytPlayer
        if (ytPlayer != null) {
          const tracklist = ytPlayer.getOption?.('captions', 'tracklist')

          if (Array.isArray(tracklist) && tracklist.length > 0) {
            const tracks: SubtitleTrack[] = tracklist.map((track: any) => ({
              languageCode: track.languageCode ?? track.id ?? '',
              displayName:
                track.displayName ??
                track.label ??
                track.languageCode ??
                'Unknown'
            }))
            setSubtitleTracks(tracks)
            onSubtitlesExtracted(tracks)
          }
        }
      } catch (error) {
        console.error(
          '[useYouTubeSubtitleExtraction] Error extracting subtitles:',
          error
        )
      } finally {
        setSubtitlesLoading(false)
        cleanupPlayer()
      }
    }

    const cleanupPlayer = (): void => {
      if (playerRef.current != null) {
        playerRef.current.pause()
        playerRef.current.dispose()
        playerRef.current = null
      }
    }

    // Extract subtitles when video starts playing
    playerRef.current.on('playing', extractSubtitles)

    // Fallback timeout - prevent hanging if video doesn't play
    const subtitleTimeout = setTimeout(() => {
      if (!extractionAttempted.current) {
        extractionAttempted.current = true
        setSubtitlesLoading(false)
        cleanupPlayer()
      }
    }, 3000)

    return () => {
      clearTimeout(subtitleTimeout)
      cleanupPlayer()
    }
  }, [videoId, enabled, videoRef, onSubtitlesExtracted])

  return {
    subtitlesLoading,
    subtitleTracks
  }
}
