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
  subtitles: { key: string; language: string; bcp47: string; vttSrc: string }[]
}

export function VideoPlayer({
  hlsUrl,
  videoTitle,
  thumbnail,
  startTime,
  endTime,
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
        controlBar: {
          children: [
            'playToggle',
            'skipBackward',
            'skipForward',
            'volumePanel',
            'currentTimeDisplay',
            'timeDivider',
            'durationDisplay',
            'progressControl',
            'liveDisplay',
            'seekToLive',
            'remainingTimeDisplay',
            'customControlSpacer',
            'playbackRateMenuButton',
            'chaptersButton',
            'descriptionsButton',
            'subtitlesButton',
            'captionsButton',
            'subsCapsButton',
            'audioTrackButton',
            'pictureInPictureToggle',
            'fullscreenToggle'
          ]
        },
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

      // Wait for next tick to ensure DOM is ready
      setTimeout(() => {
        try {
          logger('Initializing video player')
          const player = videojs(videoElement, playerOptions)
          playerRef.current = player

          // Add event listeners
          player.on('error', (error: any) => {
            logger.error('Player error:', error)
          })

          player.on('loadedmetadata', () => {
            logger('Video metadata loaded')
          })

          // Add text track event listeners
          player.on('texttrackchange', () => {
            logger('Text track changed')
            const textTracks = player.textTracks()
            logger(
              'Current text tracks:',
              Array.from(textTracks).map((track) => ({
                kind: track.kind,
                label: track.label,
                language: track.language,
                mode: track.mode,
                readyState: track.readyState
              }))
            )
          })

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

          // Load English subtitles after video is ready
          const loadSubtitles = async () => {
            try {
              logger('Starting subtitle loading...')
              logger('Available subtitles:', subtitles)

              // Find English subtitle
              const englishSubtitle = subtitles.find(
                (sub) => sub.language === 'English'
              )
              if (englishSubtitle) {
                logger('Found English subtitle:', englishSubtitle)

                try {
                  // Fetch the subtitle file first
                  logger('Fetching subtitle from:', englishSubtitle.vttSrc)
                  const response = await fetch(englishSubtitle.vttSrc, {
                    mode: 'cors',
                    credentials: 'omit'
                  })

                  if (!response.ok) {
                    throw new Error(
                      `Failed to fetch subtitle: ${response.statusText}`
                    )
                  }

                  const subtitleText = await response.text()
                  logger(
                    'Subtitle content preview:',
                    subtitleText.substring(0, 200)
                  )

                  // Validate VTT format
                  if (!subtitleText.startsWith('WEBVTT')) {
                    logger.error('Invalid VTT format - missing WEBVTT header')
                    throw new Error('Invalid VTT format')
                  }

                  // Create a blob URL for the subtitle
                  const blob = new Blob([subtitleText], { type: 'text/vtt' })
                  const blobUrl = URL.createObjectURL(blob)
                  logger('Created blob URL:', blobUrl)

                  // Add the track using the player's API
                  logger('Adding track to player with options:', {
                    kind: 'subtitles',
                    label: englishSubtitle.language,
                    srclang: englishSubtitle.bcp47,
                    src: blobUrl,
                    default: true
                  })

                  const track = player.addRemoteTextTrack(
                    {
                      kind: 'subtitles',
                      label: englishSubtitle.language,
                      srclang: englishSubtitle.bcp47,
                      src: blobUrl,
                      default: true
                    },
                    false
                  )

                  // Wait for the track to be loaded
                  track.addEventListener('load', () => {
                    logger('English subtitle track loaded successfully')

                    // Get the text track
                    const textTracks = player.textTracks()
                    logger(
                      'All text tracks:',
                      Array.from(textTracks).map((track) => ({
                        kind: track.kind,
                        label: track.label,
                        language: track.language,
                        mode: track.mode,
                        readyState: track.readyState
                      }))
                    )

                    // Find our English subtitle track
                    const englishTrack = Array.from(textTracks).find(
                      (track) =>
                        track.kind === 'subtitles' && track.label === 'English'
                    )

                    if (englishTrack) {
                      logger(
                        'Found English subtitle track, setting mode to showing'
                      )
                      englishTrack.mode = 'showing'

                      // Debug text track state
                      logger('Text track details:', {
                        kind: englishTrack.kind,
                        label: englishTrack.label,
                        language: englishTrack.language,
                        mode: englishTrack.mode,
                        readyState: englishTrack.readyState
                      })

                      // Force the player to recognize the new track
                      player.trigger('texttrackchange')
                    } else {
                      logger.warn('Could not find English subtitle track')
                    }
                  })

                  // Clean up blob URL when track is removed
                  track.addEventListener('remove', () => {
                    logger('Track removed, cleaning up blob URL')
                    URL.revokeObjectURL(blobUrl)
                  })

                  // Add error event listener
                  track.addEventListener('error', (error) => {
                    logger.warn('Error loading English subtitle track:', error)
                  })
                } catch (error) {
                  logger.error('Error fetching subtitle:', error)
                }
              } else {
                logger.warn('No English subtitle found')
              }
            } catch (error) {
              logger.warn('Failed to load subtitles:', error)
            }
          }

          // Start loading subtitles after a short delay to ensure video is ready
          setTimeout(() => {
            loadSubtitles().catch((error) => {
              logger.error('Error in subtitle loading:', error)
            })
          }, 1000)
        } catch (error) {
          logger.error('Failed to initialize video player:', error)
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
