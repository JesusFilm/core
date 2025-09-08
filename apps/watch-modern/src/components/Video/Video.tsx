import videojs from 'video.js'
import type Player from 'video.js/dist/types/player'
import { useEffect, useRef, type ReactElement } from 'react'
import 'video.js/dist/video-js.css'

interface VideoProps {
  videoVariant: {
    hls: string
  }
  onReady?: (player: Player) => void
  onEnded?: () => void
  autoplay?: boolean
}

function Video({
  videoVariant,
  onReady,
  onEnded,
  autoplay
}: VideoProps): ReactElement {
  const videoRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<Player>(null)

  useEffect(() => {
    if (videoRef.current == null) return

    if (!playerRef.current) {
      const videoElement = document.createElement('video-js')

      videoElement.classList.add('vjs-big-play-centered')
      videoRef.current.appendChild(videoElement)

      const player = (playerRef.current = videojs(
        videoElement,
        {
          autoplay: true,
          controls: true,
          aspectRatio: '16:9',
          sources: [
            {
              src: videoVariant.hls,
              type: 'application/x-mpegURL'
            }
          ],
          onEnded: onEnded
        },
        () => {
          onReady && onReady(player)
        }
      ))
    } else {
      const player = playerRef.current
      player.src({
        src: videoVariant.hls,
        type: 'application/x-mpegURL'
      })
      player.autoplay(autoplay)
    }
  }, [onReady, onEnded, videoRef, videoVariant])

  useEffect(() => {
    const player = playerRef.current

    return () => {
      if (player && !player.isDisposed()) {
        player.dispose()
        playerRef.current = null
      }
    }
  }, [playerRef])

  return (
    <div data-vjs-player>
      <div ref={videoRef} />
    </div>
  )
}

export default Video
