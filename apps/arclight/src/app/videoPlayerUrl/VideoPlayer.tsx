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
  subOn: boolean
  subtitles: { key: string; language: string; bcp47: string; vttSrc: string }[]
}

export function VideoPlayer({
  hlsUrl,
  videoTitle,
  thumbnail,
  startTime,
  endTime,
  subOn,
  subtitles
}: VideoPlayerProps): JSX.Element {
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<any>(null)

  useEffect(() => {
    // Make sure Video.js player is only initialized once
    if (!playerRef.current) {
      const videoElement = videoRef.current
      if (!videoElement) return

      // Enable debug logging
      videojs.log.level('debug')
      const logger = videojs.log.createLogger('arclight-player')

      const muxMetadata: MuxMetadata = {
        env_key: process.env.NEXT_PUBLIC_MUX_DEFAULT_REPORTING_KEY || '',
        player_name: 'arclight',
        video_title: videoTitle
      }

      const playerOptions = {
        enableSmoothSeeking: true,
        experimentalSvgIcons: true,
        preload: 'auto',
        sources: [
          {
            src: hlsUrl,
            type: 'application/x-mpegURL'
          }
        ],
        html5: {
          nativeTextTracks: false, // Force emulated text tracks
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
      }

      // Initialize player
      const initializePlayer = () => {
        try {
          const player = videojs(videoElement, playerOptions)
          playerRef.current = player

          // Add event listeners
          player.on('error', (error: any) => {
            logger.error('Player error:', error)
          })

          player.on('loadedmetadata', () => {
            // Load subtitles after video is ready
            loadSubtitles().catch((error) => {
              logger.error('Error in subtitle loading:', error)
            })
          })

          // Handle start time
          if (startTime != null) {
            player.currentTime(startTime)
          }

          // Handle end time
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

          return player
        } catch (error) {
          logger.error('Failed to initialize video player:', error)
          throw error
        }
      }

      const loadSubtitles = async () => {
        if (!subOn || subtitles.length === 0) {
          return
        }

        try {
          // Load all available subtitles
          for (const subtitle of subtitles) {
            try {
              // Fetch the subtitle file
              const response = await fetch(subtitle.vttSrc, {
                mode: 'cors',
                credentials: 'omit'
              })

              if (!response.ok) {
                throw new Error(
                  `Failed to fetch subtitle: ${response.statusText}`
                )
              }

              const subtitleText = await response.text()

              // Validate VTT format
              if (!subtitleText.startsWith('WEBVTT')) {
                logger.error('Invalid VTT format - missing WEBVTT header')
                throw new Error('Invalid VTT format')
              }

              // Create a blob URL for the subtitle
              const blob = new Blob([subtitleText], { type: 'text/vtt' })
              const blobUrl = URL.createObjectURL(blob)

              // Add the track using the player's API
              const track = playerRef.current.addRemoteTextTrack(
                {
                  kind: 'subtitles',
                  label: subtitle.language,
                  srclang: subtitle.bcp47,
                  src: blobUrl,
                  default: subtitle.language === 'English' // Set English as default if available
                },
                false
              )

              // Wait for the track to be loaded
              track.addEventListener('load', () => {
                // Get the text track
                const textTracks = playerRef.current.textTracks()

                // Find our subtitle track
                const subtitleTrack = Array.from(textTracks).find(
                  (track) =>
                    track.kind === 'subtitles' &&
                    track.label === subtitle.language
                )

                if (subtitleTrack) {
                  // Only set to showing if it's English (default)
                  if (subtitle.language === 'English') {
                    subtitleTrack.mode = 'showing'
                  }
                  playerRef.current.trigger('texttrackchange')
                } else {
                  logger.warn(
                    `Could not find ${subtitle.language} subtitle track`
                  )
                }
              })

              // Clean up blob URL when track is removed
              track.addEventListener('remove', () => {
                URL.revokeObjectURL(blobUrl)
              })

              // Add error event listener
              track.addEventListener('error', (error) => {
                logger.warn(
                  `Error loading ${subtitle.language} subtitle track:`,
                  error
                )
              })
            } catch (error) {
              logger.error(
                `Error fetching ${subtitle.language} subtitle:`,
                error
              )
            }
          }
        } catch (error) {
          logger.warn('Failed to load subtitles:', error)
        }
      }

      // Initialize player after a short delay to ensure DOM is ready
      setTimeout(() => {
        try {
          initializePlayer()
        } catch (error) {
          logger.error('Failed to initialize player:', error)
        }
      }, 0)
    }

    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.dispose()
          playerRef.current = null
        } catch (error) {
          videojs.log.warn('Error disposing player:', error)
        }
      }
    }
  }, []) // Empty dependency array to run only once

  return (
    <div className="relative w-full h-full">
      {thumbnail && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${thumbnail})` }}
        />
      )}
      <div data-vjs-player>
        <video
          className="video-js vjs-fluid relative z-10"
          id="arclight-player"
          ref={videoRef}
          poster={thumbnail ?? undefined}
          controls
          crossOrigin="anonymous"
          data-play-start={startTime ?? 0}
          data-play-end={endTime ?? 0}
        />
      </div>
    </div>
  )
}
