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
  subtitles: {
    key: string
    language: string
    bcp47: string | null
    vttSrc: string | null
    langId: string
    default: boolean
  }[]
}

export function VideoPlayer({
  hlsUrl,
  videoTitle,
  thumbnail,
  startTime = 0,
  endTime,
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

      // Configure videojs options
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

      // Initialize the player
      const vjsPlayer = videojs(ref.current, vjsOptions)

      // Handle errors
      vjsPlayer.on('error', (e: Error) => {
        console.error('VideoJS error:', e)
      })

      // Store initial Player.prototype methods before we override them
      const Player = vjsPlayer.constructor as any

      if (!Player.__originalMethods) {
        Player.__originalMethods = {
          duration: Player.prototype.duration,
          currentTime: Player.prototype.currentTime,
          buffered: Player.prototype.buffered,
          remainingTime: Player.prototype.remainingTime
        }
      }

      // Apply our custom video offset functionality
      // This mimics what the videojs-offset plugin does
      const applyOffset = (player: any, start: number, end: number = 0) => {
        // Store offset values on the player instance
        player._offsetStart = start
        player._offsetEnd = end
        player._restartBeginning = false

        // Override duration method
        Player.prototype.duration = function (...args: any[]) {
          if (
            this._offsetEnd !== undefined &&
            this._offsetStart !== undefined
          ) {
            if (this._offsetEnd > 0) {
              return this._offsetEnd - this._offsetStart
            }
            return (
              Player.__originalMethods.duration.apply(this, args) -
              this._offsetStart
            )
          }
          return Player.__originalMethods.duration.apply(this, args)
        }

        // Override currentTime method
        Player.prototype.currentTime = function (seconds: number) {
          if (seconds !== undefined) {
            if (this._offsetStart !== undefined) {
              return Player.__originalMethods.currentTime.call(
                this,
                seconds + this._offsetStart
              )
            }
            return Player.__originalMethods.currentTime.call(this, seconds)
          }

          if (this._offsetStart !== undefined) {
            const time =
              Player.__originalMethods.currentTime.apply(this) -
              this._offsetStart
            return time < 0 ? 0 : time
          }

          return Player.__originalMethods.currentTime.apply(this)
        }

        // Override remainingTime method
        Player.prototype.remainingTime = function () {
          return this.duration() - this.currentTime()
        }

        // Add a utility method to get the start offset
        Player.prototype.startOffset = function () {
          return this._offsetStart
        }

        // Add a utility method to get the end offset
        Player.prototype.endOffset = function () {
          if (this._offsetEnd > 0) {
            return this._offsetEnd
          }
          return this.duration()
        }

        // Override buffered to adjust for offsets
        Player.prototype.buffered = function () {
          const originalBuffered = Player.__originalMethods.buffered.call(this)
          const adjustedRanges = []

          for (let i = 0; i < originalBuffered.length; i++) {
            adjustedRanges[i] = [
              Math.max(0, originalBuffered.start(i) - this._offsetStart),
              Math.min(
                Math.max(0, originalBuffered.end(i) - this._offsetStart),
                this.duration()
              )
            ]
          }

          return videojs.createTimeRanges(adjustedRanges)
        }

        // Set initial time to startTime
        player.one('loadedmetadata', () => {
          // This will be adjusted by our overridden currentTime method
          // We need to explicitly set the raw time first before our offset applies
          Player.__originalMethods.currentTime.call(player, player._offsetStart)
        })

        // Add an extra check on first play to ensure we're at the right position
        player.one('play', () => {
          // Directly set to the raw offset time
          if (player._offsetStart > 0) {
            Player.__originalMethods.currentTime.call(
              player,
              player._offsetStart
            )
          }
        })

        // Monitor playback to enforce boundaries
        const onTimeUpdate = function (this: any) {
          const rawTime = Player.__originalMethods.currentTime.apply(this)
          const currTime = this.currentTime()
          const effectiveEnd =
            this._offsetEnd > 0
              ? this._offsetEnd - this._offsetStart
              : this.duration()

          // If the raw time is less than the start offset, reset it
          if (rawTime < this._offsetStart) {
            Player.__originalMethods.currentTime.call(this, this._offsetStart)
            return
          }

          if (currTime < 0) {
            this.currentTime(0)
            this.play()
          }

          if (effectiveEnd > 0 && currTime > effectiveEnd - 0.1) {
            this.pause()
            this.trigger('ended')
            this.off('timeupdate', onTimeUpdate)

            // Re-bind timeupdate when the video plays again
            this.one('play', () => {
              this.on('timeupdate', onTimeUpdate)
            })

            if (!this._restartBeginning) {
              this.currentTime(effectiveEnd)
            } else {
              this.trigger('loadstart')
              this.currentTime(0)
            }
          }
        }

        // Add the timeupdate listener when the video first plays
        player.one('play', () => {
          player.on('timeupdate', onTimeUpdate)
        })
      }

      // Store the player instance
      playerInstanceRef.current = vjsPlayer

      // When video metadata is loaded, apply our custom offset
      vjsPlayer.on('loadedmetadata', () => {
        const duration = vjsPlayer.duration() || 0

        // Only apply offset if we have a valid start or end time
        if (startTime > 0 || (endTime && endTime < duration && endTime > 0)) {
          const effectiveEndTime = endTime && endTime < duration ? endTime : 0
          applyOffset(vjsPlayer, startTime, effectiveEndTime)
        }
      })
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
        // Clean up and restore original prototype methods
        try {
          const Player = playerInstanceRef.current.constructor
          if (Player.__originalMethods) {
            Player.prototype.duration = Player.__originalMethods.duration
            Player.prototype.currentTime = Player.__originalMethods.currentTime
            Player.prototype.buffered = Player.__originalMethods.buffered
            Player.prototype.remainingTime =
              Player.__originalMethods.remainingTime
          }
          playerInstanceRef.current.dispose()
        } catch (e) {
          console.error('Error cleaning up player:', e)
        }
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
            0, // With our custom implementation, 0 is the corrected start time
            playerInstanceRef.current.currentTime() - 5
          )
          playerInstanceRef.current.currentTime(time)
          break
        case 'ArrowRight': // forward 5 seconds
          event.preventDefault()
          time = Math.min(
            playerInstanceRef.current.duration(),
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
            default={track.default}
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
