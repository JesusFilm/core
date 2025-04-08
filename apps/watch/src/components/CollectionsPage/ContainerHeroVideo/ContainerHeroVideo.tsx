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
      autoplay: false,
      preload: 'auto',
      controls: false,
      loop: true,
      muted: true,
      fluid: false,
      fill: true,
      responsive: false,
      aspectRatio: undefined,
      playsinline: true,
      html5: {
        nativeTextTracks: false,
        nativeAudioTracks: false,
        nativeVideoTracks: false,
        vhs: {
          overrideNative: true
        }
      }
    })

    playerRef.current = player
    onPlayerReady(player)

    // Add fallback autoplay attempt
    player.ready(() => {
      const playPromise = player.play()

      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.log('Autoplay prevented:', error)

          // Add a visibility check and try to play when visible
          const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                player.play().catch((e) => console.log('Play failed:', e))
              }
            })
          })

          if (videoRef.current) {
            observer.observe(videoRef.current)
          }
        })
      }
    })

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
      className="fixed top-0 left-0 right-0  h-[85%] md:h-[85%] max-w-[1919px] mx-auto z-0 bg-stone-950"
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
          src="https://stream.mux.com/J3WBxqGgXxi01201FYmW0202ayeL7PGXfuuXR02nvjQCE7bI.m3u8"
          type="application/x-mpegURL"
          data-testid="ContainerHeroVideoSource"
        />
      </video>
    </div>
  )
}
