import React, { useState, useEffect, useRef, useCallback } from 'react'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import PauseIcon from '@mui/icons-material/Pause'
import Slider from '@mui/material/Slider'

interface CustomControlsProps {
  video: HTMLVideoElement
  isHorizontal?: boolean
  videoId: string
}

export function CustomControls({
  video,
  isHorizontal,
  videoId
}: CustomControlsProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showControls, setShowControls] = useState(true)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const hideControlsTimeoutRef = useRef<NodeJS.Timeout>()

  // Update video ref when video prop changes
  useEffect(() => {
    if (!video) return // Add safety check

    videoRef.current = video
    // Set initial states
    setIsPlaying(!video.paused)
    setProgress((video.currentTime / video.duration) * 100)
  }, [video])

  // Handle time updates
  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setProgress(
        (videoRef.current.currentTime / videoRef.current.duration) * 100
      )
    }
  }, [])

  // Handle play state
  const handlePlay = useCallback(() => {
    setIsPlaying(true)
    // Reset controls visibility timer
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current)
    }
    hideControlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false)
    }, 2000)
  }, [])

  // Handle pause state
  const handlePause = useCallback(() => {
    setIsPlaying(false)
    setShowControls(true)
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current)
    }
  }, [])

  // Set up video event listeners
  useEffect(() => {
    const currentVideo = videoRef.current
    if (!currentVideo) return

    currentVideo.addEventListener('timeupdate', handleTimeUpdate)
    currentVideo.addEventListener('play', handlePlay)
    currentVideo.addEventListener('pause', handlePause)

    return () => {
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current)
      }
      if (currentVideo) {
        currentVideo.removeEventListener('timeupdate', handleTimeUpdate)
        currentVideo.removeEventListener('play', handlePlay)
        currentVideo.removeEventListener('pause', handlePause)
      }
    }
  }, [handleTimeUpdate, handlePlay, handlePause])

  // Handle play/pause toggle
  const handlePlayPause = useCallback((event: React.MouseEvent) => {
    // Stop event propagation to prevent the video click handler from firing
    event.stopPropagation()

    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play()
      } else {
        videoRef.current.pause()
      }
    }
  }, [])

  // Handle seek
  const handleSeek = useCallback(
    (event: Event, newValue: number | number[]) => {
      if (videoRef.current) {
        const time = ((newValue as number) / 100) * videoRef.current.duration
        videoRef.current.currentTime = time
        setProgress(newValue as number)
      }
    },
    []
  )

  // Handle controls visibility
  const showControlsTemporarily = useCallback(() => {
    // Only auto-hide for horizontal videos
    if (isHorizontal) {
      setShowControls(true)
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current)
      }
      if (isPlaying) {
        hideControlsTimeoutRef.current = setTimeout(() => {
          setShowControls(false)
        }, 2000)
      }
    }
  }, [isPlaying, isHorizontal])

  return (
    <Box
      onMouseEnter={isHorizontal ? showControlsTemporarily : undefined}
      onMouseMove={isHorizontal ? showControlsTemporarily : undefined}
      onMouseLeave={
        isHorizontal ? () => isPlaying && setShowControls(false) : undefined
      }
      sx={{
        position: 'relative',
        width: '100%',
        minHeight: '80px',
        background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        pointerEvents: 'auto',
        opacity: isHorizontal ? (showControls ? 1 : 0) : 1,
        transition: 'opacity 0.3s ease'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <IconButton
            onClick={handlePlayPause}
            sx={{
              color: 'white',
              padding: '12px',
              marginLeft: '-8px',
              '& svg': {
                fontSize: '32px'
              }
            }}
          >
            {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
          </IconButton>
          {!isPlaying && (
            <Box sx={{ flex: 1, marginBottom: '-6px', px: 2 }}>
              <Slider
                value={progress}
                onChange={handleSeek}
                sx={{
                  color: 'white',
                  height: 2,
                  padding: '15px 0',
                  '& .MuiSlider-thumb': {
                    width: 12,
                    height: 12,
                    transition: '0.3s cubic-bezier(.47,1.64,.41,.8)',
                    '&:hover': {
                      boxShadow: '0 0 0 8px rgba(255,255,255,0.16)'
                    }
                  }
                }}
              />
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  )
}
