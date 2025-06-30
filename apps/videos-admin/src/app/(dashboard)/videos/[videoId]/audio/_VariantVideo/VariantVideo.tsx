'use client'

import Box from '@mui/material/Box'
import { ReactElement, useCallback, useRef } from 'react'
import videojs from 'video.js'
import 'video.js/dist/video-js.css'
import Player from 'video.js/dist/types/player'

import { defaultVideoJsOptions } from '@core/shared/ui/defaultVideoJsOptions'

export function VariantVideo({
  hlsSrc
}: {
  hlsSrc: string | null
}): ReactElement {
  const playerRef = useRef<Player>()
  const hasHls = hlsSrc != null && hlsSrc !== ''

  const videoRef = useCallback((node: HTMLVideoElement | null) => {
    if (node == null) return
    playerRef.current = videojs(node, {
      ...defaultVideoJsOptions,
      fluid: true,
      controls: true
    })
  }, [])

  return (
    <Box>
      {hasHls ? (
        <video
          ref={videoRef}
          className="video-js vjs-big-play-centered"
          playsInline
        >
          <source
            data-testid="VideoSource"
            src={hlsSrc}
            type="application/x-mpegURL"
          />
        </video>
      ) : (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '200px',
            bgcolor: 'background.paper',
            borderRadius: 1
          }}
        >
          HLS stream not available
        </Box>
      )}
    </Box>
  )
}
