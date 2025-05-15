'use client'
import { useEffect, useRef } from 'react'
import videojs from 'video.js'

import { MuxMetadata } from '@core/shared/ui/muxMetadataType'
import 'video.js/dist/video-js.css'
import './VideoPlayer.css'

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
  startTime = 0,
  endTime,
  subon,
  subtitles
}: VideoPlayerProps): JSX.Element {
  const playerRef = useRef<HTMLVideoElement>(null)
  const playerInstanceRef = useRef<any>(null)

  const initPlayer = (ref: typeof playerRef): void => {
    if (ref.current == null) {
      return
    }

    try {
      const muxMetadata: MuxMetadata = {
        env_key: process.env.NEXT_PUBLIC_MUX_DEFAULT_REPORTING_KEY || '',
        player_name: 'arclight',
        video_title: videoTitle
      }

      // Video.js middleware to limit seeking to startTime and endTime range
      const timeRangeMiddleware = function (player: any) {
        return {
          setSource: function (
            srcObj: any,
            next: (arg0: null, arg1: any) => void
          ) {
            console.log('Middleware: setting source', srcObj)
            next(null, srcObj)
          },
          setCurrentTime: function (time: number) {
            const effectiveStartTime = startTime
            const effectiveEndTime = endTime ?? player.duration()

            // Clamp time to allowed range
            if (time < effectiveStartTime) {
              return effectiveStartTime
            }
            if (time > effectiveEndTime) {
              return effectiveEndTime
            }
            return time
          }
        }
      }

      // Register the middleware
      videojs.use('*', timeRangeMiddleware)

      const vjsOptions = {
        enableSmoothSeeking: true,
        experimentalSvgIcons: true,
        preload: 'auto',
        autoplay: false,
        controls: true,
        fluid: true,
        responsive: true,
        fill: true,
        playsinline: true,
        poster: thumbnail || '',
        techOrder: ['html5'],
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
          nativeTextTracks: true
        },
        plugins: {
          mux: {
            debug: false,
            data: muxMetadata
          }
        }
      }

      const vjsPlayer = videojs(ref.current, vjsOptions)

      vjsPlayer.on('error', (e: Error) => {
        console.error('VideoJS error:', e)
      })

      vjsPlayer.on('loadedmetadata', () => {
        // Set initial time to startTime
        vjsPlayer.currentTime(startTime)
      })

      vjsPlayer.on('timeupdate', () => {
        const currentTime = vjsPlayer.currentTime()
        if (currentTime == null) return
        // Ensure we stay within the clip boundaries
        if (currentTime < startTime) {
          vjsPlayer.currentTime(startTime)
        } else if (endTime && currentTime >= endTime) {
          vjsPlayer.currentTime(endTime)
          vjsPlayer.pause()
        }
      })

      // Set the player instance reference
      playerInstanceRef.current = vjsPlayer
    } catch (err) {
      console.error('Error initializing Video.js player:', err)
    }
  }

  // Initialize player on mount
  useEffect(() => {
    // Small delay before initialization to ensure DOM is ready
    const timer = setTimeout(() => {
      if (playerRef.current) {
        initPlayer(playerRef)
      } else {
        console.error('Player ref is still null after delay')
      }
    }, 100)

    return () => {
      clearTimeout(timer)
      if (playerInstanceRef.current) {
        playerInstanceRef.current.dispose()
      }
    }
  }, [])

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!playerInstanceRef.current) return

      let time: number
      let volume: number

      switch (event.key) {
        case ' ': // Space - play/pause
        case 'k': // YouTube style - play/pause
          event.preventDefault()
          if (playerInstanceRef.current.paused()) {
            playerInstanceRef.current.play()
          } else {
            playerInstanceRef.current.pause()
          }
          break
        case 'f': // fullscreen
          event.preventDefault()
          if (document.fullscreenElement) {
            document.exitFullscreen().catch((err) => console.error(err))
          } else if (playerInstanceRef.current.el().requestFullscreen) {
            playerInstanceRef.current
              .el()
              .requestFullscreen()
              .catch((err: Error) => console.error(err))
          }
          break
        case 'm': // mute
          event.preventDefault()
          playerInstanceRef.current.muted(!playerInstanceRef.current.muted())
          break
        case 'ArrowLeft': // back 5 seconds
          event.preventDefault()
          time = Math.max(
            startTime,
            playerInstanceRef.current.currentTime() - 5
          )
          playerInstanceRef.current.currentTime(time)
          break
        case 'ArrowRight': // forward 5 seconds
          event.preventDefault()
          time = Math.min(
            endTime ?? playerInstanceRef.current.duration(),
            playerInstanceRef.current.currentTime() + 5
          )
          playerInstanceRef.current.currentTime(time)
          break
        case 'ArrowUp': // volume up
          event.preventDefault()
          volume = Math.min(1, playerInstanceRef.current.volume() + 0.1)
          playerInstanceRef.current.volume(volume)
          if (playerInstanceRef.current.muted()) {
            playerInstanceRef.current.muted(false)
          }
          break
        case 'ArrowDown': // volume down
          event.preventDefault()
          volume = Math.max(0, playerInstanceRef.current.volume() - 0.1)
          playerInstanceRef.current.volume(volume)
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [startTime, endTime])

  return (
    <div data-vjs-player className="video-js-container vjs-hd">
      <video
        className="video-js vjs-default-skin vjs-big-play-centered arclight-player"
        id="arclight-player"
        ref={playerRef}
        data-play-start={startTime ?? 0}
        data-play-end={endTime ?? 0}
        playsInline
        controls
        preload="auto"
        crossOrigin="anonymous"
      >
        <source src={hlsUrl} type="application/x-mpegURL" />
        {subtitles.map((track, idx) => (
          <track
            key={track.language + track.bcp47 + idx}
            kind="subtitles"
            src={track.vttSrc ?? ''}
            srcLang={track.bcp47 ?? undefined}
            label={track.language}
            default={subon && idx === 0}
          />
        ))}
        <p
          className="vjs-no-js"
          // eslint-disable-next-line i18next/no-literal-string
        >
          To view this video please enable JavaScript, and consider upgrading to
          a web browser that{' '}
          <a
            href="https://videojs.com/html5-video-support/"
            target="_blank"
            rel="noreferrer"
            // eslint-disable-next-line i18next/no-literal-string
          >
            supports HTML5 video
          </a>
        </p>
      </video>
    </div>
  )
}
