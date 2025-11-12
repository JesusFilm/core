import Stack from '@mui/material/Stack'
import Box from '@mui/system/Box'
import { ReactElement, useEffect, useRef } from 'react'
import videojs from 'video.js'

import { getCaptionsAndSubtitleTracks } from '@core/journeys/ui/Video/utils/getCaptionsAndSubtitleTracks'
import VideoJsPlayer from '@core/journeys/ui/Video/utils/videoJsTypes'
import { defaultVideoJsOptions } from '@core/shared/ui/defaultVideoJsOptions'

import type { VideoDetailsProps } from '../../VideoDetails/VideoDetails'

import 'video.js/dist/video-js.css'

export function MuxDetails({
  open,
  activeVideoBlock
}: Pick<
  VideoDetailsProps,
  'open' | 'activeVideoBlock' | 'onSelect'
>): ReactElement {
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<VideoJsPlayer | null>(null)

  const updateSubtitleTracks = (player: VideoJsPlayer | null): void => {
    if (player == null) return

    const tracks = getCaptionsAndSubtitleTracks(player)
    tracks.forEach((track) => {
      if (track.kind === 'subtitles') {
        track.mode =
          (activeVideoBlock?.showGeneratedSubtitles ?? false)
            ? 'showing'
            : 'hidden'
      }
    })
  }

  useEffect(() => {
    if (
      open &&
      videoRef.current != null &&
      activeVideoBlock?.mediaVideo?.__typename === 'MuxVideo' &&
      activeVideoBlock?.mediaVideo?.playbackId != null
    ) {
      playerRef.current = videojs(videoRef.current, {
        ...defaultVideoJsOptions,
        fluid: true,
        controls: true,
        poster: `https://image.mux.com/${activeVideoBlock.mediaVideo.playbackId}/thumbnail.png?time=1`
      }) as VideoJsPlayer

      const player = playerRef.current

      // Listen for loadedmetadata event, reliable way for knowing when tracks are ready
      // Added for edge case on intial view of player where useEffect does not have tracks
      const handleLoadedMetadata = (): void => {
        updateSubtitleTracks(playerRef.current)
      }

      player.on('loadedmetadata', handleLoadedMetadata)

      return () => {
        if (playerRef.current != null) {
          playerRef.current.off('loadedmetadata', handleLoadedMetadata)
        }
      }
    }
  }, [
    activeVideoBlock,
    open,
    videoRef,
    activeVideoBlock?.showGeneratedSubtitles
  ])

  useEffect(() => {
    updateSubtitleTracks(playerRef.current)
  })

  return (
    <Stack spacing={4} sx={{ p: 6 }} data-testid="MuxDetails">
      <Box
        role="region"
        aria-label="Video Player"
        tabIndex={0}
        sx={{
          borderRadius: 3,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <video
          ref={videoRef}
          className="video-js vjs-tech vjs-big-play-centered"
          playsInline
        >
          {activeVideoBlock?.mediaVideo?.__typename === 'MuxVideo' &&
            activeVideoBlock?.mediaVideo?.playbackId != null && (
              <source
                src={`https://stream.mux.com/${activeVideoBlock?.mediaVideo?.playbackId}.m3u8`}
                type="application/x-mpegURL"
              />
            )}
        </video>
      </Box>
    </Stack>
  )
}
