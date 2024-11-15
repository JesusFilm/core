import Stack from '@mui/material/Stack'
import Box from '@mui/system/Box'
import { ReactElement, useEffect, useRef } from 'react'
import videojs from 'video.js'
import Player from 'video.js/dist/types/player'

import { defaultVideoJsOptions } from '@core/shared/ui/defaultVideoJsOptions'

import type { VideoDetailsProps } from '../../VideoDetails/VideoDetails'
import 'video.js/dist/video-js.css'

export function MuxDetails({
  id,
  image
}: Pick<
  VideoDetailsProps,
  'open' | 'id' | 'onSelect' | 'image'
>): ReactElement {
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<Player>()

  useEffect(() => {
    if (videoRef.current != null && id != null) {
      playerRef.current = videojs(videoRef.current, {
        ...defaultVideoJsOptions,
        fluid: true,
        controls: true,
        poster: image ?? ''
      })
    }
  }, [id])

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
          <source
            src={`https://stream.mux.com/${id ?? ''}.m3u8`}
            type="application/x-mpegURL"
          />
        </video>
      </Box>
    </Stack>
  )
}
