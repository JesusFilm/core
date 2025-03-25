import { useQuery } from '@apollo/client'
import Fullscreen from '@mui/icons-material/Fullscreen'
import FullscreenExit from '@mui/icons-material/FullscreenExit'
import PauseRounded from '@mui/icons-material/PauseRounded'
import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded'
import VolumeOff from '@mui/icons-material/VolumeOff'
import VolumeUp from '@mui/icons-material/VolumeUp'
import IconButton from '@mui/material/IconButton'
import Slider from '@mui/material/Slider'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useRef, useState } from 'react'
import videojs from 'video.js'
import Player from 'video.js/dist/types/player'

import { defaultVideoJsOptions } from '@core/shared/ui/defaultVideoJsOptions'

import { GET_VIDEO_CONTENT } from '../../../../../pages/watch/[part1]/[part2]'

import { useIsInViewport } from './utils/useIsInViewport'

interface VideoPlayerProps {
  contentId: string
  title?: string
  mutePage?: boolean
  setMutePage?: (muted: boolean) => void
}

export function CollectionVideoPlayer({
  contentId,
  title,
  mutePage,
  setMutePage
}: VideoPlayerProps): ReactElement {
  const { t } = useTranslation('apps-watch')
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const [player, setPlayer] = useState<Player>()
  const [isMuted, setIsMuted] = useState(mutePage)
  const [progress, setProgress] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isPlayerReady, setIsPlayerReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  const isVisible = useIsInViewport(containerRef)

  const {
    data: videoData,
    loading: videoLoading,
    error: videoError
  } = useQuery(GET_VIDEO_CONTENT, {
    variables: {
      id: contentId
    }
  })

  useEffect(() => {
    if (player && isPlayerReady) {
      const handleTimeUpdate = () => {
        const currentTime = player.currentTime()
        const duration = player.duration()
        if (currentTime && duration && duration > 0) {
          setProgress((currentTime / duration) * 100)
        }
      }

      player.on('timeupdate', handleTimeUpdate)
      return () => {
        player.off('timeupdate', handleTimeUpdate)
      }
    }
  }, [player, isPlayerReady])

  const handleSeek = (_event: Event, newValue: number | number[]) => {
    if (player && isPlayerReady && typeof newValue === 'number') {
      const duration = player.duration()
      if (duration) {
        const newTime = (duration * newValue) / 100
        player.currentTime(newTime)
      }
    }
  }

  // Handle fullscreen
  const handleFullscreen = () => {
    if (containerRef.current && player && isPlayerReady) {
      if (!isFullscreen) {
        if (containerRef.current.requestFullscreen) {
          void containerRef.current.requestFullscreen()
          if (isMuted && player?.muted != null) {
            player.muted(false)
            setIsMuted(false)
          }
        }
      } else {
        if (document.exitFullscreen) {
          void document.exitFullscreen()
        }
      }
      setIsFullscreen(!isFullscreen)
    }
  }

  const handleMuteToggle = () => {
    if (player && isPlayerReady) {
      const newMutedState = !isMuted
      player.muted(newMutedState)
      setIsMuted(newMutedState)
      setMutePage?.(newMutedState)
    }
  }

  // Sync with pageMuted changes from context
  useEffect(() => {
    if (player && isPlayerReady && player?.muted != null) {
      player?.muted(mutePage)
      setIsMuted(mutePage)
    }
  }, [mutePage, player, isPlayerReady, contentId])

  const handlePlayPause = () => {
    if (player && isPlayerReady) {
      if (isPlaying) {
        player.pause()
        setIsPlaying(false)
      } else {
        void player?.play()
        setIsPlaying(true)
      }
    }
  }

  // Control video playback and mute state based on visibility
  useEffect(() => {
    if (player && isPlayerReady) {
      if (isVisible) {
        player.muted(mutePage)
        setIsMuted(mutePage)
        void player.play()
        setIsPlaying(true)
      } else {
        player.pause()
        setIsPlaying(false)
      }
    }
  }, [isVisible, player, isPlayerReady, mutePage, contentId])

  useEffect(() => {
    if (player && isPlayerReady) {
      const handlePlay = () => {
        setIsPlaying(true)
      }
      const handlePause = () => {
        setIsPlaying(false)
      }
      player.on('play', handlePlay)
      player.on('pause', handlePause)
    }
  }, [player, isPlayerReady])

  // Initialize player
  useEffect(() => {
    if (videoRef.current != null && videoData?.content != null) {
      const newPlayer = videojs(videoRef.current, {
        ...defaultVideoJsOptions,
        muted: true,
        controls: false,
        controlBar: false,
        bigPlayButton: false,
        preload: 'auto',
        loop: true,
        fluid: true,
        aspectRatio: '16:9',
        poster: videoData.content.images?.[0]?.mobileCinematicHigh ?? undefined
      })

      // Wait for player to be ready
      newPlayer.ready(() => {
        setIsPlayerReady(true)

        if (videoData.content.variant?.hls) {
          newPlayer.src({
            src: videoData.content.variant.hls,
            type: 'application/x-mpegURL'
          })
        }
      })

      setPlayer(newPlayer)

      return () => {
        setIsPlayerReady(false)
        if (newPlayer) {
          newPlayer.dispose()
        }
      }
    }
  }, [videoData, contentId])

  return (
    <div
      className="relative cursor-pointer"
      ref={containerRef}
      onClick={handlePlayPause}
    >
      <div className="beveled block relative aspect-video rounded-lg overflow-hidden bg-black shadow-2xl shadow-stone-950/70">
        {/* Video container */}
        <div className="absolute inset-0 w-full h-full">
          <video
            className="video-js vjs-fluid vjs-default-skin absolute inset-0 w-full h-full object-cover"
            ref={videoRef}
            playsInline
          />
        </div>

        {/* Fullscreen button */}
        <IconButton
          onClick={handleFullscreen}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            color: 'white'
          }}
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
        </IconButton>

        {/* small Mute button */}
        {!isMuted && (
          <IconButton
            onClick={handleMuteToggle}
            sx={{
              position: 'absolute',
              top: 16,
              left: 16,
              color: 'white'
            }}
            aria-label="Mute video"
          >
            <VolumeUp />
          </IconButton>
        )}

        {/* Custom controls overlay */}
        <div
          className="absolute bottom-0 left-0 right-0 z-30 py-1 px-4"
          style={{
            transition: 'opacity 0.3s ease'
          }}
        >
          <div className="flex items-center justify-between">
            {/* Progress bar */}
            <IconButton
              onClick={handlePlayPause}
              sx={{
                color: 'white',
                padding: '16px',
                transition: 'opacity 0.3s ease'
              }}
              aria-label={isPlaying ? 'Pause video' : 'Play video'}
            >
              {isPlaying ? <PauseRounded /> : <PlayArrowRounded />}
            </IconButton>
            <Slider
              value={progress}
              onChange={handleSeek}
              aria-label="Video progress"
              sx={{
                color: '#fff',
                height: 4,
                '& .MuiSlider-thumb': {
                  width: 8,
                  height: 8,
                  transition: '0.3s cubic-bezier(.47,1.64,.41,.8)',
                  '&:hover, &.Mui-focusVisible': {
                    boxShadow: '0px 0px 0px 8px rgba(255, 0, 0, 0.16)'
                  }
                },
                '& .MuiSlider-rail': {
                  opacity: 0.28
                }
              }}
            />
          </div>
        </div>
        {/* Large Mute button */}
        {isMuted && (
          <IconButton
            onClick={handleMuteToggle}
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: 'white',
              padding: '24px',
              '& .MuiSvgIcon-root': {
                fontSize: '48px'
              }
            }}
            aria-label="Unmute video"
          >
            <VolumeOff />
          </IconButton>
        )}

        {/* Loading and error states */}
        {videoLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-20">
            <p className="text-white font-medium">{t('Loading video...')}</p>
          </div>
        )}
        {videoError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-20">
            <p className="text-red-500 font-medium">
              {t('Error loading video: {{ videoError }}', {
                videoError: videoError.message
              })}
            </p>
          </div>
        )}
      </div>
      <h6 className="text-lg font-medium mt-2 text-white">
        {title || videoData?.content?.title?.[0]?.value || t('Loading...')}
      </h6>
    </div>
  )
}
