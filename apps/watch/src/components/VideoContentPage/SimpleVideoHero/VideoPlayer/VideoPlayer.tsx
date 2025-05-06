import { ReactElement, useCallback, useEffect, useRef } from 'react'
import videojs from 'video.js'
import Player from 'video.js/dist/types/player'
import 'video.js/dist/video-js.css'

import { defaultVideoJsOptions } from '@core/shared/ui/defaultVideoJsOptions'

import { useVideo } from '../../../../libs/videoContext'

interface PlayerProps {
  onMutedChange: (isMuted: boolean) => void
  onPlayerReady: (player: Player) => void
}

export function VideoPlayer({
  onMutedChange,
  onPlayerReady
}: PlayerProps): ReactElement {
  const { variant, title } = useVideo()
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<Player | null>(null)

  const pauseVideoOnScrollAway = useCallback((): void => {
    const scrollY = window.scrollY
    if (playerRef.current) {
      if (scrollY > 100) {
        playerRef.current.pause()
      } else if (scrollY === 0) {
        void playerRef.current.play()
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
    const player = videojs(videoRef.current, {
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

    playerRef.current = player
    onPlayerReady(player)

    // Sync muted state with player
    player.on('volumechange', () => {
      onMutedChange(player.muted() ?? true)
    })

    void player.src(variant?.hls ?? '')

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose()

        playerRef.current = null
      }
    }
  }, [onMutedChange, onPlayerReady])

  return (
    <div
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
          src={variant?.hls ?? ''}
          type="application/x-mpegURL"
          data-testid="ContainerHeroVideoSource"
        />
      </video>
    </div>
  )
}
