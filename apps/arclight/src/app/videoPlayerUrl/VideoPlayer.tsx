'use client'
import MuxPlayer from '@mux/mux-player-react'
import { useEffect, useRef } from 'react'
import videojs from 'video.js'

import { MuxMetadata } from '@core/shared/ui/muxMetadataType'
import 'video.js/dist/video-js.css'

import 'videojs-mux'

interface VideoPlayerProps {
  hlsUrl: string
  videoTitle: string
  thumbnail?: string | null
  isMux?: boolean
  playbackId?: string
  videoId?: string
}

export function VideoPlayer({
  hlsUrl,
  videoTitle,
  thumbnail,
  isMux = false,
  playbackId,
  videoId
}: VideoPlayerProps): JSX.Element {
  const playerRef = useRef<HTMLVideoElement>(null)

  const initPlayer = (ref: typeof playerRef): void => {
    if (ref.current == null) return
    const muxMetadata: MuxMetadata = {
      env_key: process.env.NEXT_PUBLIC_MUX_DEFAULT_REPORTING_KEY || '',
      player_name: 'arclight',
      video_title: videoTitle
    }

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
      },
      plugins: {
        mux: {
          debug: false,
          data: muxMetadata
        }
      }
    })
  }

  useEffect(() => {
    if (playerRef.current != null && !isMux) {
      initPlayer(playerRef)
    }
  }, [isMux])

  if (isMux && playbackId) {
    return (
      <div className="relative w-full h-full">
        <MuxPlayer
          streamType="on-demand"
          playbackId={playbackId}
          metadata={{
            video_id: videoId ?? '',
            video_title: videoTitle,
            player_name: 'arclight'
          }}
          style={{
            width: '100%',
            height: '100%'
          }}
          poster={thumbnail ?? undefined}
        />
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      {thumbnail && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${thumbnail})` }}
        />
      )}
      <video
        className="video-js vjs-fluid relative z-10"
        id="arclight-player"
        ref={playerRef}
        poster={thumbnail ?? undefined}
        controls
      >
        <source src={hlsUrl} type="application/x-mpegURL" />
      </video>
    </div>
  )
}
