'use client'

import Box from '@mui/material/Box'
import { ReactElement, useCallback, useRef } from 'react'
import videojs from 'video.js'
import 'video.js/dist/video-js.css'
import Player from 'video.js/dist/types/player'

import { defaultVideoJsOptions } from '@core/shared/ui/defaultVideoJsOptions'

export function VariantVideo({
  videoSrc
}: {
  videoSrc: string | undefined
}): ReactElement {
  const playerRef = useRef<Player>()

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
      <video
        ref={videoRef}
        className="video-js vjs-big-play-centered"
        playsInline
      >
        <source data-testid="VideoSource" src={videoSrc} type="video/mp4" />
      </video>
    </Box>
  )
}
