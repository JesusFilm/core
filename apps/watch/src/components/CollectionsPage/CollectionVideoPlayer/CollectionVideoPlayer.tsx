import { useQuery } from '@apollo/client'
import Fullscreen from '@mui/icons-material/Fullscreen'
import FullscreenExit from '@mui/icons-material/FullscreenExit'
import PauseRounded from '@mui/icons-material/PauseRounded'
import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded'
import VolumeOff from '@mui/icons-material/VolumeOff'
import VolumeUp from '@mui/icons-material/VolumeUp'
import IconButton from '@mui/material/IconButton'
import Slider from '@mui/material/Slider'
import fscreen from 'fscreen'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useRef, useState } from 'react'
import videojs from 'video.js'
import Player from 'video.js/dist/types/player'

import { defaultVideoJsOptions } from '@core/shared/ui/defaultVideoJsOptions'
import { isIOS } from '@core/shared/ui/deviceUtils'

import { GET_VIDEO_CONTENT } from '../../../../pages/watch/[part1]/[part2]'

import { useIsInViewport } from './utils/useIsInViewport'

interface VideoPlayerProps {
  contentId: string
  title?: string
  mutePage?: boolean
  setMutePage?: (muted: boolean) => void
}

export function CollectionVideoPlayer({
  contentId,
  mutePage,
  setMutePage
}: VideoPlayerProps): ReactElement {
  const { t } = useTranslation('apps-watch')
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const [player, setPlayer] = useState<Player>()
  const [isMuted, setIsMuted] = useState(mutePage)
  const [progress, setProgress] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(
    fscreen?.fullscreenElement != null
  )
  const [isPlayerReady, setIsPlayerReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  const isVisible = useIsInViewport(containerRef)

  // const videoSlugWithoutLanguageSl = useMemo(() => contentId.split('/')[0], [])

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

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = (): void => {
      const fullscreen =
        fscreen.fullscreenElement != null || (player?.isFullscreen() ?? false)
      setIsFullscreen(fullscreen)

      // For iOS devices, handle fullscreen exit specially
      if (!fullscreen && isIOS()) {
        // iOS often needs special handling when exiting fullscreen
        if (isPlaying) {
          // Keep playing if it was playing before
          void player?.play()
        } else {
          // Make sure it's paused if it wasn't playing
          player?.pause()
        }
      }

      // Auto unmute in fullscreen if it was muted
      if (fullscreen && isMuted && player) {
        player.muted(false)
        setIsMuted(false)
        setMutePage?.(false)
      }
    }

    if (fscreen.fullscreenEnabled) {
      fscreen.addEventListener('fullscreenchange', handleFullscreenChange)
    } else if (player) {
      player.on('fullscreenchange', handleFullscreenChange)
    }

    return () => {
      if (fscreen.fullscreenEnabled) {
        fscreen.removeEventListener('fullscreenchange', handleFullscreenChange)
      } else if (player) {
        player.off('fullscreenchange', handleFullscreenChange)
      }
    }
  }, [player, isPlaying, isMuted, setMutePage])

  // Handle fullscreen
  const handleFullscreen = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation() // Prevent the click from triggering play/pause
    }

    if (containerRef.current && player && isPlayerReady) {
      if (!isFullscreen) {
        if (fscreen.fullscreenEnabled) {
          void fscreen.requestFullscreen(containerRef.current)
        } else {
          void player.requestFullscreen()
        }

        // Auto-unmute when entering fullscreen
        if (isMuted && player?.muted != null) {
          player.muted(false)
          setIsMuted(false)
          setMutePage?.(false)
        }

        // Auto-play when entering fullscreen (if not already playing)
        if (!isPlaying) {
          void player.play()
          setIsPlaying(true)
        }
      } else {
        if (fscreen.fullscreenEnabled) {
          void fscreen.exitFullscreen()
        } else {
          void player.exitFullscreen()
        }
      }
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

  // control video playback
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
    if (
      videoRef.current != null &&
      player == null &&
      videoData?.content != null
    ) {
      const newPlayer = videojs(videoRef.current, {
        ...defaultVideoJsOptions,
        autoplay: false,
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

      newPlayer.ready(() => {
        setIsPlayerReady(true)

        setIsFullscreen(
          fscreen.fullscreenElement != null ||
            (newPlayer.isFullscreen() ?? false)
        )

        if (videoData.content.variant?.hls) {
          newPlayer.src({
            src: videoData.content.variant.hls,
            type: 'application/x-mpegURL'
          })
        }
      })

      setPlayer(newPlayer)
    }
  }, [videoData, contentId, player, isPlayerReady])

  return (
    <div
      className="relative mb-4 padded cursor-pointer"
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
    </div>
  )
}
