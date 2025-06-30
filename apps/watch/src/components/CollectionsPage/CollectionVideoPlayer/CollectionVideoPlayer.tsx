import { useQuery } from '@apollo/client'
import Fullscreen from '@mui/icons-material/Fullscreen'
import FullscreenExit from '@mui/icons-material/FullscreenExit'
import PauseRounded from '@mui/icons-material/PauseRounded'
import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded'
import VolumeOff from '@mui/icons-material/VolumeOff'
import VolumeUp from '@mui/icons-material/VolumeUp'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Slider from '@mui/material/Slider'
import Typography from '@mui/material/Typography'
import { sendGTMEvent } from '@next/third-parties/google'
import fscreen from 'fscreen'
import debounce from 'lodash/debounce'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useRef, useState } from 'react'
import videojs from 'video.js'
import Player from 'video.js/dist/types/player'

import { defaultVideoJsOptions } from '@core/shared/ui/defaultVideoJsOptions'
import { isIOS } from '@core/shared/ui/deviceUtils'
import { secondsToTimeFormat } from '@core/shared/ui/timeFormat'

import { GET_VIDEO_CONTENT } from '../../../../pages/watch/[part1]/[part2]'

import { useIsInViewport } from './utils/useIsInViewport'

interface VideoPlayerProps {
  contentId: string
  title?: string
  mutePage?: boolean
  setMutePage?: (muted: boolean) => void
  startAt?: number
}

export function CollectionVideoPlayer({
  contentId,
  mutePage,
  setMutePage,
  startAt
}: VideoPlayerProps): ReactElement {
  const { t } = useTranslation('apps-watch')
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const [player, setPlayer] = useState<Player>()
  const [isMuted, setIsMuted] = useState(mutePage)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [displayTime, setDisplayTime] = useState('0:00')
  const [isFullscreen, setIsFullscreen] = useState(
    fscreen?.fullscreenElement != null
  )
  const [isPlayerReady, setIsPlayerReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  const isVisible = useIsInViewport(containerRef)

  function evtToDataLayer(
    eventType,
    mcId,
    langId,
    title,
    language,
    seconds,
    percent
  ): void {
    sendGTMEvent({
      event: eventType,
      mcId,
      langId,
      title,
      language,
      percent,
      seconds,
      dateTimeUTC: new Date().toISOString()
    })
  }
  const eventToDataLayer = debounce(evtToDataLayer, 500)

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
        const time = player.currentTime() ?? 0
        const videoDuration = player.duration() ?? 0

        setCurrentTime(time)
        setDuration(videoDuration)
        setDisplayTime(secondsToTimeFormat(time, { trimZeroes: true }))
      }

      const handleDurationChange = () => {
        setDuration(player.duration() ?? 0)
      }

      player.on('timeupdate', handleTimeUpdate)
      player.on('durationchange', handleDurationChange)

      return () => {
        player.off('timeupdate', handleTimeUpdate)
        player.off('durationchange', handleDurationChange)
      }
    }
  }, [player, isPlayerReady])

  const handleSeek = (_event: Event, newValue: number | number[]) => {
    if (player && isPlayerReady && typeof newValue === 'number') {
      eventToDataLayer(
        'video_seek',
        videoData?.content.id,
        videoData?.content.variant?.language.id,
        videoData?.content.title[0].value,
        videoData?.content.variant?.language?.name.find(
          ({ primary }) => !primary
        )?.value ?? videoData?.content.variant?.language?.name[0]?.value,
        Math.round(newValue),
        Math.round((newValue / (player.duration() ?? 1)) * 100)
      )
      player.currentTime(newValue)
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
        eventToDataLayer(
          'video_enter_full_screen',
          videoData?.content.id,
          videoData?.content.variant?.language.id,
          videoData?.content.title[0].value,
          videoData?.content.variant?.language?.name.find(
            ({ primary }) => !primary
          )?.value ?? videoData?.content.variant?.language?.name[0]?.value,
          Math.round(player.currentTime() ?? 0),
          Math.round(
            ((player.currentTime() ?? 0) / (player.duration() ?? 1)) * 100
          )
        )
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
        eventToDataLayer(
          'video_exit_full_screen',
          videoData?.content.id,
          videoData?.content.variant?.language.id,
          videoData?.content.title[0].value,
          videoData?.content.variant?.language?.name.find(
            ({ primary }) => !primary
          )?.value ?? videoData?.content.variant?.language?.name[0]?.value,
          Math.round(player.currentTime() ?? 0),
          Math.round(
            ((player.currentTime() ?? 0) / (player.duration() ?? 1)) * 100
          )
        )
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

      eventToDataLayer(
        `video_mute_toggle_${newMutedState ? 'unmute' : 'mute'}`,
        videoData?.content.id,
        videoData?.content.variant?.language.id,
        videoData?.content.title[0].value,
        videoData?.content.variant?.language?.name.find(
          ({ primary }) => !primary
        )?.value ?? videoData?.content.variant?.language?.name[0]?.value,
        Math.round(player.currentTime() ?? 0),
        Math.round(
          ((player.currentTime() ?? 0) / (player.duration() ?? 1)) * 100
        )
      )

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
      eventToDataLayer(
        `video_play_pause_${isPlaying ? 'pause' : 'play'}`,
        videoData?.content.id,
        videoData?.content.variant?.language.id,
        videoData?.content.title[0].value,
        videoData?.content.variant?.language?.name.find(
          ({ primary }) => !primary
        )?.value ?? videoData?.content.variant?.language?.name[0]?.value,
        Math.round(player.currentTime() ?? 0),
        Math.round(
          ((player.currentTime() ?? 0) / (player.duration() ?? 1)) * 100
        )
      )
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
        eventToDataLayer(
          `video_autoplay_starts`,
          videoData?.content.id,
          videoData?.content.variant?.language.id,
          videoData?.content.title[0].value,
          videoData?.content.variant?.language?.name.find(
            ({ primary }) => !primary
          )?.value ?? videoData?.content.variant?.language?.name[0]?.value,
          Math.round(player.currentTime() ?? 0),
          Math.round(
            ((player.currentTime() ?? 0) / (player.duration() ?? 1)) * 100
          )
        )
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

  // send event when video is ended but the video is not muted (meaning they are actively watching the video)
  useEffect(() => {
    if (player && isPlayerReady) {
      player.on('ended', () => {
        if (!isMuted) {
          eventToDataLayer(
            'video_ended',
            videoData?.content.id,
            videoData?.content.variant?.language.id,
            videoData?.content.title[0].value,
            videoData?.content.variant?.language?.name.find(
              ({ primary }) => !primary
            )?.value ?? videoData?.content.variant?.language?.name[0]?.value,
            Math.round(player.currentTime() ?? 0),
            Math.round(
              ((player.currentTime() ?? 0) / (player.duration() ?? 1)) * 100
            )
          )
        }
      })
    }
  }, [player, isPlayerReady, videoData])

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

          if (startAt != null)
            newPlayer.one('loadedmetadata', () => {
              if (startAt > 0) {
                newPlayer.currentTime(startAt / 1000)
              }
            })
        }
      })

      setPlayer(newPlayer)
    }
  }, [videoData, contentId, player, isPlayerReady])

  return (
    <div className="relative mb-4 padded cursor-pointer" ref={containerRef}>
      <div className="beveled block relative aspect-video rounded-lg overflow-hidden bg-black shadow-2xl shadow-stone-950/70">
        {/* Video container */}
        <div
          className="absolute inset-0 w-full h-full"
          onClick={handlePlayPause}
        >
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
          <div className="flex items-center justify-between gap-2">
            {/* Play/Pause button */}
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

            {/* Progress slider */}
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
              <Slider
                value={currentTime}
                onChange={handleSeek}
                min={0}
                max={duration || 100}
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
            </Box>

            {/* Time display */}
            <Typography
              variant="caption"
              sx={{
                color: 'white',
                mr: 1,
                ml: 1,
                minWidth: '60px',
                textAlign: 'right'
              }}
            >
              {displayTime} /{' '}
              {secondsToTimeFormat(duration, { trimZeroes: true })}
            </Typography>
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
            <p className="text-white font-medium">{'Loading video...'}</p>
          </div>
        )}
        {videoError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-20">
            <p className="text-red-500 font-medium">
              {'Error loading video: ' + videoError.message}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
