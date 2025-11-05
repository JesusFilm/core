import Stack from '@mui/material/Stack'
import Box from '@mui/system/Box'
import { ReactElement, useEffect, useRef } from 'react'
import videojs from 'video.js'
import Player from 'video.js/dist/types/player'

import { defaultVideoJsOptions } from '@core/shared/ui/defaultVideoJsOptions'

import type { VideoDetailsProps } from '../../VideoDetails/VideoDetails'

import 'video.js/dist/video-js.css'
import { getCaptionsAndSubtitleTracks } from '@core/journeys/ui/Video/utils/getCaptionsAndSubtitleTracks'
import VideoJsPlayer from '@core/journeys/ui/Video/utils/videoJsTypes'

export function MuxDetails({
  open,
  activeVideoBlock
}: Pick<
  VideoDetailsProps,
  'open' | 'activeVideoBlock' | 'onSelect'
>): ReactElement {
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<VideoJsPlayer | null>(null)

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
    }
  }, [
    activeVideoBlock,
    open,
    videoRef,
    activeVideoBlock?.showGeneratedSubtitles
  ])

  useEffect(() => {
    if (playerRef.current != null) {
      const tracks = getCaptionsAndSubtitleTracks(playerRef.current)
      tracks.forEach((track) => {
        if (track.kind === 'subtitles') {
          track.mode =
            (activeVideoBlock?.showGeneratedSubtitles ?? false)
              ? 'showing'
              : 'hidden'
        }
      })
    }
  })

  return (
    <Stack spacing={4} sx={{ p: 6 }} data-testid="MuxDetails">
      <Box
        sx={{
          borderRadius: 3,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <video
          ref={videoRef}
          className="video-js vjs-big-play-centered"
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
