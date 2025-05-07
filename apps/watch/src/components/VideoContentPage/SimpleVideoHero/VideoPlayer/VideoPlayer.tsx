import Box from '@mui/material/Box'
import { ReactElement, useCallback, useEffect, useRef } from 'react'
import videojs from 'video.js'
import Player from 'video.js/dist/types/player'
import 'video.js/dist/video-js.css'

import { defaultVideoJsOptions } from '@core/shared/ui/defaultVideoJsOptions'

import { useVideo } from '../../../../libs/videoContext'

interface PlayerProps {
  onMutedChange: (isMuted: boolean) => void
  handleSetPlayer: (player: Player | null) => void
  player: Player | null
}

export function VideoPlayer({
  onMutedChange,
  handleSetPlayer,
  player
}: PlayerProps): ReactElement {
  const { variant } = useVideo()
  const src = variant?.hls ?? ''
  const videoRef = useRef<HTMLVideoElement>(null)

  const pauseVideoOnScrollAway = useCallback((): void => {
    const scrollY = window.scrollY
    if (player != null) {
      if (scrollY > 700) {
        player.pause()
      } else {
        void player.play()
      }
    }
  }, [player])

  useEffect(() => {
    window.addEventListener('scroll', pauseVideoOnScrollAway)
    return () => window.removeEventListener('scroll', pauseVideoOnScrollAway)
  }, [pauseVideoOnScrollAway, player])

  useEffect(() => {
    if (!videoRef.current) return

    // Initialize player
    handleSetPlayer(
      videojs(videoRef.current, {
        ...defaultVideoJsOptions,
        autoplay: true,
        controls: false,
        loop: true,
        muted: true,
        fluid: false,
        fill: true,
        responsive: false,
        aspectRatio: undefined
      })
    )

    return () => {
      if (player != null) {
        player.dispose()

        handleSetPlayer(null)
      }
    }
  }, [onMutedChange, handleSetPlayer])

  return (
    <Box data-testid="ContainerHeroVideo">
      <video
        data-testid="ContainerHeroVideoApplication"
        ref={videoRef}
        className="video-js"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
        playsInline
      >
        <source
          src={src}
          type="application/x-mpegURL"
          data-testid="ContainerHeroVideoSource"
        />
      </video>
    </Box>
  )
}
