'use client'

import { type ReactElement, useEffect, useRef, useState } from 'react'
import { CSSTransition } from 'react-transition-group'
import type Player from 'video.js/dist/types/player'

interface VideoControlsProps {
  player: Player | null
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

export function VideoControls({ player }: VideoControlsProps): ReactElement {
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [buffered, setBuffered] = useState(0)
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [hoverPosition, setHoverPosition] = useState<number | null>(null)
  const [hoverTime, setHoverTime] = useState(0)
  const [showPlayPauseIcon, setShowPlayPauseIcon] = useState(false)
  const [playPauseIconType, setPlayPauseIconType] = useState<'play' | 'pause'>(
    'play'
  )
  const [controlsVisible, setControlsVisible] = useState(true)
  const iconRef = useRef<HTMLDivElement>(null)
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const iconTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!player) return

    const updateTime = () => {
      setCurrentTime(player.currentTime() || 0)
    }

    const updateDuration = () => {
      setDuration(player.duration() || 0)
    }

    const updateBuffered = () => {
      const bufferedRanges = player.buffered()
      const playerDuration = player.duration() || 0
      if (bufferedRanges.length > 0 && playerDuration > 0) {
        const bufferedEnd = bufferedRanges.end(bufferedRanges.length - 1)
        setBuffered((bufferedEnd / playerDuration) * 100)
      } else {
        setBuffered(0)
      }
    }

    const updatePlaying = () => {
      setPlaying(!player.paused())
    }

    const updateMuted = () => {
      setMuted(player.muted() ?? false)
    }

    const updateVolume = () => {
      setVolume(player.volume() ?? 0)
    }

    const handleFullscreenChange = () => {
      setIsFullscreen(player.isFullscreen() ?? false)
    }

    const handleTimeUpdate = () => {
      updateTime()
      updateBuffered()
    }

    const handleVolumeChange = () => {
      updateMuted()
      updateVolume()
    }

    player.on('timeupdate', handleTimeUpdate)
    player.on('durationchange', updateDuration)
    player.on('progress', updateBuffered)
    player.on('loadedmetadata', updateBuffered)
    player.on('canplay', updateBuffered)
    player.on('play', updatePlaying)
    player.on('pause', updatePlaying)
    player.on('volumechange', handleVolumeChange)
    player.on('fullscreenchange', handleFullscreenChange)

    updateTime()
    updateDuration()
    updateBuffered()
    updatePlaying()
    updateMuted()
    updateVolume()
    handleFullscreenChange()

    return () => {
      player.off('timeupdate', handleTimeUpdate)
      player.off('durationchange', updateDuration)
      player.off('progress', updateBuffered)
      player.off('loadedmetadata', updateBuffered)
      player.off('canplay', updateBuffered)
      player.off('play', updatePlaying)
      player.off('pause', updatePlaying)
      player.off('volumechange', handleVolumeChange)
      player.off('fullscreenchange', handleFullscreenChange)
    }
  }, [player])

  useEffect(() => {
    if (!playing) {
      setControlsVisible(true)
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current)
        hideTimeoutRef.current = null
      }
      return
    }

    const startHideTimer = () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current)
      }
      hideTimeoutRef.current = setTimeout(() => {
        setControlsVisible(false)
      }, 2000)
    }

    setControlsVisible(true)
    startHideTimer()

    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current)
      }
    }
  }, [playing])

  useEffect(() => {
    return () => {
      if (iconTimeoutRef.current) {
        clearTimeout(iconTimeoutRef.current)
      }
    }
  }, [])

  const showControls = () => {
    setControlsVisible(true)
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
    }
    if (playing) {
      hideTimeoutRef.current = setTimeout(() => {
        setControlsVisible(false)
      }, 2000)
    }
  }

  const handlePlayPause = (showIcon = false) => {
    if (!player) return
    const wasPaused = player.paused()
    if (wasPaused) {
      void player.play()
    } else {
      player.pause()
    }
    if (showIcon) {
      if (iconTimeoutRef.current) {
        clearTimeout(iconTimeoutRef.current)
      }
      setShowPlayPauseIcon(true)
      iconTimeoutRef.current = setTimeout(() => {
        setShowPlayPauseIcon(false)
      }, 1000)
    }
  }

  const handleVideoClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!player) return

    const target = e.target as HTMLElement
    const isControlClick =
      target.closest('[data-controls-bar]') !== null ||
      target.closest('[data-progress-bar]') !== null ||
      target.tagName === 'BUTTON' ||
      target.closest('button') !== null

    if (!isControlClick) {
      const wasPaused = player.paused()
      // Set icon type before toggling (show what we're transitioning TO)
      setPlayPauseIconType(wasPaused ? 'play' : 'pause')
      setShowPlayPauseIcon(true)
      handlePlayPause()

      // Hide after animation completes (200ms fade in + 1000ms hold + 200ms fade out = 1400ms)
      if (iconTimeoutRef.current) {
        clearTimeout(iconTimeoutRef.current)
      }
      iconTimeoutRef.current = setTimeout(() => {
        setShowPlayPauseIcon(false)
      }, 1400)
    }
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!player || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percent = x / rect.width
    const newTime = percent * duration
    setCurrentTime(newTime)
    player.currentTime(newTime)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return
    showControls()
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100))
    setHoverPosition(percent)
    setHoverTime((percent / 100) * duration)
  }

  const handleMouseLeave = () => {
    setHoverPosition(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!player || !duration) return

    let newTime = currentTime
    const seekStep = 5

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault()
        newTime = Math.max(0, currentTime - seekStep)
        break
      case 'ArrowRight':
        e.preventDefault()
        newTime = Math.min(duration, currentTime + seekStep)
        break
      case 'Home':
        e.preventDefault()
        newTime = 0
        break
      case 'End':
        e.preventDefault()
        newTime = duration
        break
      case 'PageUp':
        e.preventDefault()
        newTime = Math.min(duration, currentTime + 10)
        break
      case 'PageDown':
        e.preventDefault()
        newTime = Math.max(0, currentTime - 10)
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        newTime = currentTime
        break
      default:
        return
    }

    setCurrentTime(newTime)
    player.currentTime(newTime)
  }

  const handleMute = () => {
    if (!player) return
    player.muted(!player.muted())
  }

  const handleFullscreen = () => {
    if (!player) return
    if (player.isFullscreen()) {
      void player.exitFullscreen()
    } else {
      void player.requestFullscreen()
    }
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div
      className="absolute inset-0 z-10 flex flex-col"
      data-video-controls
      onClick={handleVideoClick}
      onMouseMove={showControls}
    >
      <CSSTransition
        nodeRef={iconRef}
        in={showPlayPauseIcon}
        timeout={1400}
        classNames="play-pause-icon"
        unmountOnExit
      >
        <div
          ref={iconRef}
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-black/50">
            {playPauseIconType === 'pause' ? (
              <svg
                className="h-20 w-20 fill-white"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg
                className="h-20 w-20 fill-white"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </div>
        </div>
      </CSSTransition>
      <style>{`
        .play-pause-icon-enter {
          opacity: 0;
          transform: scale(0.95);
        }
        .play-pause-icon-enter-active {
          opacity: 1;
          transform: scale(1);
          transition: opacity 200ms ease-in-out, transform 200ms ease-in-out;
        }
        .play-pause-icon-enter-done {
          opacity: 1;
          transform: scale(1);
        }
        .play-pause-icon-exit {
          opacity: 1;
          transform: scale(1);
        }
        .play-pause-icon-exit-active {
          opacity: 0;
          transform: scale(0.95);
          transition: opacity 200ms ease-in-out 1000ms, transform 200ms ease-in-out 1000ms;
        }
      `}</style>
      <div
        className={`mt-auto px-4 transition-opacity duration-300 ${
          controlsVisible ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <div>
          <div
            className="relative h-2 w-full cursor-pointer rounded-full bg-white/20 focus:ring-2 focus:ring-white/50 focus:outline-none"
            data-progress-bar
            role="slider"
            tabIndex={0}
            aria-label="Seek"
            aria-valuemin={0}
            aria-valuemax={duration}
            aria-valuenow={currentTime}
            aria-valuetext={formatTime(currentTime)}
            onClick={handleSeek}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onKeyDown={handleKeyDown}
          >
            <div
              className="absolute top-0 left-0 h-full rounded-full bg-white/40"
              style={{ width: `${buffered}%` }}
            />
            {hoverPosition !== null && (
              <>
                <div
                  className="absolute top-0 left-0 h-full rounded-full bg-white/60"
                  style={{ width: `${hoverPosition}%` }}
                />
                <div
                  className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded bg-black/80 px-2 py-1 text-xs whitespace-nowrap text-white"
                  style={{ left: `${hoverPosition}%` }}
                >
                  {formatTime(hoverTime)}
                </div>
              </>
            )}
            <div
              className="absolute top-0 left-0 h-full rounded-full bg-[#cb333b]"
              style={{ width: `${progressPercent}%` }}
            />
            <div
              className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#cb333b]"
              style={{ left: `${progressPercent}%` }}
            />
          </div>
        </div>
        <div
          className="flex h-[60px] items-center gap-2 bg-transparent"
          data-controls-bar
          onMouseEnter={showControls}
        >
          <button
            onClick={() => handlePlayPause()}
            className="!flex h-[45px] w-[45px] cursor-pointer items-center justify-center rounded-full !bg-black/25 text-white hover:opacity-80"
            aria-label={playing ? 'Pause' : 'Play'}
          >
            {playing ? (
              <svg
                className="h-8 w-8 fill-current"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg
                className="h-8 w-8 fill-current"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
          <button
            onClick={handleMute}
            className="!flex h-[45px] w-[45px] cursor-pointer items-center justify-center rounded-full !bg-black/25 text-white hover:opacity-80"
            aria-label={muted ? 'Unmute' : 'Mute'}
          >
            {muted || volume === 0 ? (
              <svg
                className="h-8 w-8 fill-current"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
              </svg>
            ) : (
              <svg
                className="h-8 w-8 fill-current"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
              </svg>
            )}
          </button>
          <div className="ml-auto flex h-[45px] items-center rounded-full bg-black/25 px-3 py-1.5 text-sm text-white">
            <span>{formatTime(currentTime)}</span>
            <span>/</span>
            <span>{formatTime(duration)}</span>
          </div>
          <button
            onClick={handleFullscreen}
            className="!flex h-[45px] w-[45px] cursor-pointer items-center justify-center rounded-full !bg-black/25 text-white hover:opacity-80"
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? (
              <svg
                className="h-8 w-8 fill-current"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
              </svg>
            ) : (
              <svg
                className="h-8 w-8 fill-current"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
