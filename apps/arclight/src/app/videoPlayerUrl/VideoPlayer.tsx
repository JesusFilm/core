'use client'
import { useEffect, useRef } from 'react'
import videojs from 'video.js'

import { MuxMetadata } from '@core/shared/ui/muxMetadataType'
import 'video.js/dist/video-js.css'

import 'videojs-mux'

interface VideoPlayerProps {
  hlsUrl: string
  videoTitle: string
  thumbnail?: string | null
  startTime?: number
  endTime?: number
  subon: boolean
  subtitles: {
    key: string
    language: string
    bcp47: string | null
    vttSrc: string | null
  }[]
}

export function VideoPlayer({
  hlsUrl,
  videoTitle,
  thumbnail,
  startTime,
  endTime,
  subon,
  subtitles
}: VideoPlayerProps): JSX.Element {
  const playerRef = useRef<HTMLVideoElement>(null)

  const initPlayer = (ref: typeof playerRef): void => {
    if (ref.current == null) return
    const muxMetadata: MuxMetadata = {
      env_key: process.env.NEXT_PUBLIC_MUX_DEFAULT_REPORTING_KEY || '',
      player_name: 'arclight',
      video_title: videoTitle
    }

    const player = videojs(ref.current, {
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
    }) as any

    // Enable first subtitle track if subon is true
    if (subon && subtitles.length > 0) {
      player.ready(() => {
        const tracks = player.textTracks()
        for (let i = 0; i < tracks.length; i++) {
          const track = tracks[i]
          if (track.kind === 'subtitles') {
            track.mode = 'showing'
            break // Only enable the first subtitle track
          }
        }
      })
    }

    if (startTime != null) {
      player.currentTime(startTime)
    }

    if (endTime != null) {
      player.on('timeupdate', () => {
        if (player.currentTime() >= endTime) {
          player.currentTime(endTime)
          player.pause()
        }
      })
      player.on('ended', () => {
        player.currentTime(endTime)
        player.pause()
      })
    }
  }

  useEffect(() => {
    if (playerRef.current != null) {
      initPlayer(playerRef)
    }
  }, [])

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
        data-play-start={startTime ?? 0}
        data-play-end={endTime ?? 0}
      >
        <source src={hlsUrl} type="application/x-mpegURL" />
        {subtitles.map((subtitle) => (
          <track
            key={subtitle.key}
            kind="subtitles"
            label={subtitle.language}
            src={subtitle.vttSrc ?? ''}
            srcLang={subtitle.bcp47 ?? undefined}
            default={subtitle.language === 'English'}
          />
        ))}
      </video>
    </div>
  )
}
