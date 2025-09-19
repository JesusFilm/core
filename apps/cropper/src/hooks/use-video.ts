'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import videojs from 'video.js'
import Player from 'video.js/dist/types/player'
import { defaultVideoJsOptions } from '@core/shared/ui/defaultVideoJsOptions'
import { MuxMetadata } from '@core/shared/ui/muxMetadataType'

import type { Video } from '../types'
import { clampTime } from '../lib/video-utils'

import 'video.js/dist/video-js.css'
import 'videojs-mux'

const FALLBACK_DEBUG_HLS_SRC = process.env.NEXT_PUBLIC_DEBUG_HLS_SRC ?? ''

interface VideoControls {
  video: Video | null
  currentTime: number
  duration: number
  isPlaying: boolean
  bind: (element: HTMLVideoElement | null) => void
  load: (video: Video | null) => void
  seek: (time: number) => void
  togglePlayback: () => void
  setPlaying: (playing: boolean) => void
}

export function useVideo(): VideoControls {
  const playerRef = useRef<Player | null>(null)
  const videoElementRef = useRef<HTMLVideoElement | null>(null)
  const playerElementRef = useRef<HTMLVideoElement | null>(null)
  const latestVideoRef = useRef<Video | null>(null)
  const [video, setVideo] = useState<Video | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const teardownPlayer = useCallback(() => {
    if (!playerRef.current) return

    try {
      playerRef.current.dispose()
    } catch (error) {
      console.warn('Error disposing player:', error)
    }

    playerRef.current = null
    playerElementRef.current = null
    setIsPlaying(false)
  }, [])

  const initializePlayer = useCallback(
    (element: HTMLVideoElement, source: Video) => {
      const attemptInit = (attempt = 0) => {
        requestAnimationFrame(() => {
          if (videoElementRef.current !== element) {
            return
          }

          const rootNode = element.getRootNode?.() as Document | ShadowRoot | undefined
          const isConnected =
            element.isConnected ||
            (rootNode instanceof Document ? rootNode.contains(element) : rootNode?.host?.isConnected) ||
            !!element.parentNode
          const hasDimensions = element.offsetWidth > 0 && element.offsetHeight > 0

          if (!isConnected) {
            if (attempt < 120) {
              if (attempt % 30 === 0) {
                console.warn(`🎬 Waiting for video element to connect (${attempt + 1}/120)`) // periodic log for visibility
              }
              attemptInit(attempt + 1)
              return
            }

            console.warn('🎬 Proceeding with Video.js initialization even though the element never reported connected')
          }

          if (!hasDimensions && attempt < 20) {
            attemptInit(attempt + 1)
            return
          }

          if (!hasDimensions) {
            console.warn('🎬 Proceeding with Video.js initialization despite zero dimensions')
          }

          if (playerRef.current) {
            return
          }

          const muxMetadata: MuxMetadata = {
            env_key: process.env.NEXT_PUBLIC_MUX_DEFAULT_REPORTING_KEY || '',
            player_name: 'cropper',
            video_title: source.title || 'Cropper Video',
            video_id: source.slug || ''
          }

          const player = videojs(element, {
            ...defaultVideoJsOptions,
            autoplay: false,
            controls: false,
            controlBar: false,
            bigPlayButton: false,
            responsive: true,
            fluid: true,
            plugins: {
              mux: {
                debug: false,
                data: muxMetadata
              }
            }
          })

          player.ready(() => {
            const resolvedSrc = source.src || FALLBACK_DEBUG_HLS_SRC

            if (!resolvedSrc) {
              console.error('🎬 No playable source available for video:', source.slug)
              return
            }

            const isMP4 = resolvedSrc.includes('.mp4') || resolvedSrc.includes('video/mp4')
            const sourceType = isMP4 ? 'video/mp4' : 'application/x-mpegURL'

            console.log(`🎬 Initializing source: ${resolvedSrc} (type: ${sourceType})`)

            player.src({
              src: resolvedSrc,
              type: sourceType
            })

            if (source.poster) {
              player.poster(source.poster)
            }

            player.load()

            if (source.duration) {
              setDuration(source.duration)
            }
          })

          let lastLoggedTime = -1

          player.on('timeupdate', () => {
            const time = player.currentTime()
            if (time != null) {
              setCurrentTime(time)

              if (Math.abs(time - lastLoggedTime) >= 0.25) {
                lastLoggedTime = time
                console.log(`🎬 Playback time update: ${time.toFixed(2)}s`)
              }
            }
          })

          player.on('loadedmetadata', () => {
            const detectedDuration = player.duration() || source.duration || 0
            setDuration(detectedDuration)
            console.log(`🎬 Metadata loaded. Duration: ${detectedDuration.toFixed(2)}s`)
          })

          player.on('play', () => {
            setIsPlaying(true)
            console.log('🎬 Player state: playing')
          })

          player.on('pause', () => {
            setIsPlaying(false)
            console.log('🎬 Player state: paused')
          })

          player.on('ended', () => {
            setIsPlaying(false)
            console.log('🎬 Player state: ended')
          })

          playerElementRef.current = element
          playerRef.current = player
        })
      }

      attemptInit()
    },
    []
  )

  const bind = useCallback(
    (element: HTMLVideoElement | null) => {
      if (element === null) {
        if (!videoElementRef.current) {
          return
        }

        videoElementRef.current = null
        teardownPlayer()
        return
      }

      if (playerElementRef.current === element && playerRef.current) {
        return
      }

      videoElementRef.current = element

      if (playerElementRef.current && playerElementRef.current !== element) {
        teardownPlayer()
      }

      const activeVideo = latestVideoRef.current
      if (!activeVideo) {
        return
      }

      initializePlayer(element, activeVideo)
    },
    [initializePlayer, teardownPlayer]
  )

  const load = useCallback((nextVideo: Video | null) => {
    latestVideoRef.current = nextVideo
    setVideo(nextVideo)
    setCurrentTime(0)
    setDuration(nextVideo?.duration ?? 0)
    setIsPlaying(false)

    // If we have a player and new video, update the source
    if (playerRef.current && nextVideo) {
      // Determine source type based on URL
      const isMP4 = nextVideo.src.includes('.mp4') || nextVideo.src.includes('video/mp4')

      let sourceType = 'application/x-mpegURL' // default to HLS
      if (isMP4) {
        sourceType = 'video/mp4'
      }

      console.log(`🎬 Updating video source: ${nextVideo.src} (type: ${sourceType})`)

      playerRef.current.src({
        src: nextVideo.src,
        type: sourceType
      })

      if (nextVideo.poster) {
        playerRef.current.poster(nextVideo.poster)
      }

      playerRef.current.load()
      return
    }

    if (!playerRef.current && videoElementRef.current && nextVideo) {
      initializePlayer(videoElementRef.current, nextVideo)
      return
    }

    if (!nextVideo) {
      teardownPlayer()
    }
  }, [initializePlayer, teardownPlayer])

  const seek = useCallback((time: number) => {
    if (!playerRef.current || !video) return

    const clamped = clampTime(time, video.duration)
    setCurrentTime(clamped)
    playerRef.current.currentTime(clamped)
  }, [video])

  const togglePlayback = useCallback(() => {
    if (!playerRef.current) return

    if (playerRef.current.paused()) {
      void playerRef.current.play()
      setIsPlaying(true)
    } else {
      playerRef.current.pause()
      setIsPlaying(false)
    }
  }, [])

  const setPlaying = useCallback((playing: boolean) => {
    if (!playerRef.current) return

    if (playing) {
      void playerRef.current.play()
    } else {
      playerRef.current.pause()
    }
    setIsPlaying(playing)
  }, [])

  useEffect(() => {
    latestVideoRef.current = video
  }, [video])

  // Ensure player is disposed on unmount
  useEffect(() => {
    return () => {
      teardownPlayer()
    }
  }, [teardownPlayer])

  return {
    video,
    currentTime,
    duration,
    isPlaying,
    bind,
    load,
    seek,
    togglePlayback,
    setPlaying
  }
}
