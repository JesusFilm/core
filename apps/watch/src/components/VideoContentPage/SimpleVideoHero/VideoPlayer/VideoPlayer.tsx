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
      if (scrollY > 100) {
        player.pause()
      } else if (scrollY === 0) {
        void player.play()
      }
    }
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', pauseVideoOnScrollAway)
    return () => window.removeEventListener('scroll', pauseVideoOnScrollAway)
  }, [pauseVideoOnScrollAway])

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

  useEffect(() => {
    if (player != null) {
      // Sync muted state with player
      player.on('volumechange', () => {
        onMutedChange(player.muted() ?? true)
      })

      void player.src(src)
    }
  }, [player])

  return (
    <Box
      // className="fixed top-0 left-0 right-0  h-[85%] md:h-[85%] max-w-[1919px] mx-auto z-0 bg-stone-950"
      data-testid="ContainerHeroVideo"
    >
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
