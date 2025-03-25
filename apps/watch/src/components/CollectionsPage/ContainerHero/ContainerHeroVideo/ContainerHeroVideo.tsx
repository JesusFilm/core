import { ReactElement, useCallback, useEffect, useRef } from 'react'
import videojs from 'video.js'
import Player from 'video.js/dist/types/player'
import 'video.js/dist/video-js.css'

import { defaultVideoJsOptions } from '@core/shared/ui/defaultVideoJsOptions'

interface ContainerHeroVideoProps {
  onMutedChange: (isMuted: boolean) => void
  onPlayerReady: (player: Player) => void
}

export function ContainerHeroVideo({
  onMutedChange,
  onPlayerReady
}: ContainerHeroVideoProps): ReactElement {
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

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose()

        playerRef.current = null
      }
    }
  }, [onMutedChange, onPlayerReady])

  return (
    <div
      className="fixed top-0 left-0 right-0 w-full h-[55%] sm:h-[75%] md:h-[85%]"
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
          src="https://stream.mux.com/OWsElOe7FF8fR8lwFVY4uqGFc01xgKwQZIIcrIgu4aKc.m3u8"
          type="application/x-mpegURL"
          data-testid="ContainerHeroVideoSource"
        />
      </video>
    </div>
  )
}
