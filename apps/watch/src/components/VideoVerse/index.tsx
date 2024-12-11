import { Box, Typography } from '@mui/material'
import VolumeUpIcon from '@mui/icons-material/VolumeUp'
import VolumeOffIcon from '@mui/icons-material/VolumeOff'
import { type VideoContent } from '../VideoTypes'
import { keyframes } from '@mui/system'
import { useState, useEffect } from 'react'

type TimedText = {
  text: string
  duration: number
}

interface VideoVerseProps {
  videoSrc: string
  verse: TimedText[]
}

export default function VideoVerse({
  videoSrc,
  verse
}: VideoVerseProps): JSX.Element {
  const [currentTextIndex, setCurrentTextIndex] = useState(() =>
    verse.length > 0 ? 0 : -1
  )
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(
    null
  )
  const [isHovered, setIsHovered] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  const textAppear = keyframes`
    0% {
      opacity: 0;
    }
    100% {
      opacity: 0.7;
    }
  `

  const textGrow = keyframes`
    0% {
      transform: scale(.8);
    }
    100% {
      transform: scale(1.15);
    }
  `

  useEffect(() => {
    if (verse.length === 0) {
      setCurrentTextIndex(-1)
      return
    }
    setCurrentTextIndex(0)
  }, [verse])

  useEffect(() => {
    if (!isHovered || verse.length === 0) return

    const interval = setInterval(
      () => {
        setCurrentTextIndex((prev) => (prev + 1) % verse.length)
      },
      (verse[currentTextIndex]?.duration ?? 3) * 1000
    )

    return () => clearInterval(interval)
  }, [verse.length, isHovered, currentTextIndex, verse])

  useEffect(() => {
    if (videoElement && videoSrc) {
      videoElement.preload = 'metadata'

      const handleLoadedMetadata = () => {
        videoElement.currentTime = 0.001
      }

      const handleLoadedData = () => {
        videoElement.pause()
      }

      videoElement.addEventListener('loadedmetadata', handleLoadedMetadata)
      videoElement.addEventListener('loadeddata', handleLoadedData)

      videoElement.load()

      return () => {
        videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata)
        videoElement.removeEventListener('loadeddata', handleLoadedData)
      }
    }
  }, [videoElement, videoSrc])

  const handleMouseEnter = async () => {
    setIsHovered(true)
    if (videoElement) {
      try {
        setIsPlaying(true)
        const playPromise = videoElement.play()
        if (playPromise !== undefined) {
          await playPromise
        }
      } catch (error) {
        console.error('Error playing video:', error)
        setIsPlaying(false)
      }
    }
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    if (videoElement && isPlaying) {
      setIsPlaying(false)
      videoElement.pause()
    }
  }

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (videoElement && isPlaying) {
        videoElement.pause()
        setIsPlaying(false)
      }
    }
  }, [videoElement, isPlaying])

  return (
    <Box
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      sx={{
        width: '100%',
        maxWidth: '400px',
        aspectRatio: '9/16',
        backgroundColor: '#000',
        borderRadius: '16px',
        overflow: 'hidden',
        // mb: 6,
        position: 'relative',
        cursor: 'pointer',
        boxShadow:
          '2px 8px 8px rgba(0, 0, 0, 0.2), 3px 8px 16px rgba(10, 0, 0, 0.1)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: 'inherit',
          backdropFilter: 'brightness(.6)  blur(40px)',
          //   backgroundColor: 'rgb(0 0 0 / 70%)',
          zIndex: 1,
          pointerEvents: 'none',
          mask: 'radial-gradient(circle at left -60%, transparent 70%, white 80%),  radial-gradient(circle at left 80%, transparent 75%, white 90%) '
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: 'inherit',
          zIndex: 1,
          pointerEvents: 'none',
          mixBlendMode: 'screen',
          boxShadow: 'inset 0 0 1px rgba(255, 255, 255, 0.45)'
        }
      }}
    >
      <Box
        component="video"
        ref={setVideoElement}
        sx={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          backgroundColor: '#000',
          '&::-webkit-media-controls': {
            display: 'none !important'
          },
          '&::-webkit-media-controls-enclosure': {
            display: 'none !important'
          }
        }}
        playsInline
        webkit-playsinline="true"
        x-webkit-airplay="deny"
        disablePictureInPicture
        controlsList="nodownload nofullscreen noremoteplayback"
        muted
        loop
        preload="metadata"
        poster={`${videoSrc}?thumb=1`}
      >
        <source src={videoSrc} type="video/mp4" />
        Your browser does not support the video tag.
      </Box>
      <Box
        sx={{
          position: 'absolute',
          bottom: '10%',
          left: 6,
          right: 6,
          zIndex: 3,
          color: 'white'
        }}
      >
        <Typography
          key={currentTextIndex}
          variant="h6"
          sx={{
            fontSize: '1.4rem',
            fontWeight: 800,
            letterSpacing: '-.5px',
            textTransform: 'uppercase',
            // opacity: currentTextIndex === -1 ? 0 : 0.7,
            animation:
              isHovered && currentTextIndex !== -1
                ? `${textAppear} 0.8s ease-out forwards,
                 ${textGrow} 4s linear infinite`
                : 'none',
            textAlign: 'center',
            minHeight: '1.5em',
            transformOrigin: 'center center'
          }}
        >
          {currentTextIndex !== -1 ? verse[currentTextIndex]?.text : ''}
        </Typography>
      </Box>
    </Box>
  )
}
