'use client'

import { useEffect, useRef } from 'react'
import videojs from 'video.js'
import 'video.js/dist/video-js.css'

interface VideoPlayerProps {
  hlsUrl: string
}

export function VideoPlayer({ hlsUrl }: VideoPlayerProps): JSX.Element {
  const playerRef = useRef<HTMLVideoElement>(null)

  const initPlayer = (ref: typeof playerRef): void => {
    if (ref.current == null) return
    videojs(ref.current, {
      enableSmoothSeeking: true,
      experimentalSvgIcons: true,
      preload: 'none',
      html5: {
        vhs: {
          limitRenditionByPlayerDimensions: false,
          useNetworkInformationApi: true,
          useDevicePixelRatio: true
        },
        hls: {
          limitRenditionByPlayerDimensions: false,
          useNetworkInformationApi: true,
          useDevicePixelRatio: true
        }
      }
    })
  }

  useEffect(() => {
    if (playerRef.current != null) {
      initPlayer(playerRef)
    }
  }, [])

  return (
    <video className="video-js vjs-fluid" ref={playerRef} controls>
      <source src={hlsUrl} type="application/x-mpegURL" />
    </video>
  )
}
