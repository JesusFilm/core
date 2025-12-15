'use client'

import { useTranslations } from 'next-intl'
import { type ReactElement, useEffect, useRef, useState } from 'react'
import videojs from 'video.js'
import type Player from 'video.js/dist/types/player'

import type { MuxMetadata } from '@core/shared/ui/muxMetadataType'

import { VideoControls } from './VideoControls'

import { env } from '@/env'

import 'videojs-mux'
import 'video.js/dist/video-js.css'

interface VideoPlayerProps {
  hlsUrl: string
  videoTitle: string
  thumbnail?: string | null
  onVideoEnd?: () => void
}

export function VideoPlayer({
  hlsUrl,
  videoTitle,
  thumbnail,
  onVideoEnd
}: VideoPlayerProps): ReactElement {
  const t = useTranslations('VideoPlayer')
  const playerRef = useRef<HTMLVideoElement>(null)
  const [player, setPlayer] = useState<Player | null>(null)

  useEffect(() => {
    if (playerRef.current == null) {
      return
    }

    const element = playerRef.current

    let existingPlayer: Player | null = null
    try {
      const player = videojs.getPlayer(element)
      if (player) {
        existingPlayer = player
      }
    } catch {
      // No existing player
    }

    if (existingPlayer) {
      try {
        existingPlayer.dispose()
      } catch (e) {
        console.error('Error disposing existing player:', e)
      }
    }

    let vjsPlayer: Player

    try {
      const muxMetadata: MuxMetadata = {
        env_key: env.NEXT_PUBLIC_MUX_DEFAULT_REPORTING_KEY ?? '',
        player_name: 'player',
        video_title: videoTitle
      }

      const vjsOptions = {
        errorDisplay: false,
        enableSmoothSeeking: true,
        experimentalSvgIcons: true,
        preload: 'auto',
        autoplay: true,
        muted: true,
        controls: false,
        fluid: true,
        responsive: true,
        fill: false,
        playsinline: true,
        poster: thumbnail || '',
        techOrder: ['html5'],
        aspectRatio: '16:9',
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
          },
          nativeTextTracks: false,
          nativeCaptions: false
        },
        plugins: {
          mux: {
            debug: false,
            data: muxMetadata
          }
        }
      }

      vjsPlayer = videojs(element, vjsOptions)
      setPlayer(vjsPlayer)

      vjsPlayer.on('error', (e: Error) => {
        console.error('VideoJS error:', e)
      })

      if (onVideoEnd) {
        vjsPlayer.on('ended', () => {
          onVideoEnd()
        })
      }

      if (hlsUrl) {
        vjsPlayer.src({
          src: hlsUrl,
          type: 'application/x-mpegURL'
        })
      }
    } catch (err) {
      console.error('Error initializing Video.js player:', err)
    }

    return () => {
      if (vjsPlayer && !vjsPlayer.isDisposed()) {
        try {
          vjsPlayer.dispose()
        } catch (e) {
          console.error('Error cleaning up player:', e)
        }
      }
      setPlayer(null)
    }
  }, [])

  useEffect(() => {
    if (playerRef.current == null) {
      return
    }

    const player = videojs.getPlayer(playerRef.current)
    if (player && !player.isDisposed()) {
      if (hlsUrl) {
        player.src({ src: hlsUrl, type: 'application/x-mpegURL' })

        const handleCanPlay = () => {
          player.play()?.catch(() => {
            // Ignore play() errors (e.g., autoplay restrictions)
          })
          player.off('canplay', handleCanPlay)
        }

        player.on('canplay', handleCanPlay)
      }
    }
  }, [hlsUrl])

  useEffect(() => {
    if (playerRef.current == null) {
      return
    }

    const player = videojs.getPlayer(playerRef.current)
    if (player && !player.isDisposed() && thumbnail !== undefined) {
      player.poster(thumbnail || '')
    }
  }, [thumbnail])

  useEffect(() => {
    if (playerRef.current == null) {
      return
    }

    const player = videojs.getPlayer(playerRef.current)
    if (player && !player.isDisposed() && onVideoEnd) {
      player.off('ended')
      player.on('ended', () => {
        onVideoEnd()
      })
    }
  }, [onVideoEnd])

  const handleVideoClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!player) return

    const target = e.target as HTMLElement
    const isControlClick =
      target.closest('[data-video-controls]') !== null ||
      target.tagName === 'BUTTON' ||
      target.closest('button') !== null

    if (!isControlClick) {
      if (player.paused()) {
        void player.play()
      } else {
        player.pause()
      }
    }
  }

  return (
    <div
      data-vjs-player
      className="video-js-container vjs-hd relative"
      onClick={handleVideoClick}
    >
      <video
        className="video-js vjs-default-skin vjs-big-play-centered player-video"
        ref={playerRef}
        playsInline
        muted
        preload="auto"
        crossOrigin="anonymous"
      >
        <source src={hlsUrl} type="application/x-mpegURL" />
        <p className="vjs-no-js">
          {t.rich('lackOfBrowserSupport', {
            link: (chunks) => (
              <a
                href="https://videojs.com/html5-video-support/"
                target="_blank"
                rel="noreferrer"
              >
                {chunks}
              </a>
            )
          })}
        </p>
      </video>
      {player && <VideoControls player={player} />}
    </div>
  )
}
