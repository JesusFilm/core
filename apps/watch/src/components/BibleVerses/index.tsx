import React, { type ReactElement, useState, useEffect, useRef } from 'react'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import SearchIcon from '@mui/icons-material/Search'
import IconButton from '@mui/material/IconButton'
import { useTranslation } from 'next-i18next'
import VolumeUpIcon from '@mui/icons-material/VolumeUp'
import VolumeOffIcon from '@mui/icons-material/VolumeOff'
import Chip from '@mui/material/Chip'
import ColorThief from 'colorthief'
import { motion } from 'framer-motion'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/swiper-bundle.css'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import HelpIcon from '@mui/icons-material/Help'
import { VideoPlayerProps } from './VideoPlayer' // Import the new component
import Grid from '@mui/material/Grid'
import { useTheme } from '@mui/material/styles'
import { VideoModal } from './VideoModal'

// import { SearchBarProvider } from '@core/journeys/ui/algolia/SearchBarProvider'
// import { SearchBar } from '@core/journeys/ui/SearchBar'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'

import { HomeHero } from './HomeHero'
import { SeeAllVideos } from './SeeAllVideos'
import { VideoContext, VideoProvider, useVideo } from './VideoContext'

interface SharedVideoCardProps {
  avatarSrc: string
  name: string
  message: string
}

const SharedVideoCard = ({
  avatarSrc,
  name,
  message
}: SharedVideoCardProps) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      mb: 4,
      position: 'relative',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      padding: '16px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
      '&::after': {
        content: '""',
        position: 'absolute',
        bottom: '-10px',
        left: '35px',
        width: 0,
        height: 0,
        borderLeft: '10px solid transparent',
        borderRight: '10px solid transparent',
        borderTop: '10px solid rgba(255, 255, 255, 0.1)'
      }
    }}
  >
    <Avatar
      src={avatarSrc}
      sx={{
        width: 60,
        height: 60,
        mr: 2,
        border: '2px solid',
        borderColor: 'rgba(255, 255, 255, 0.2)'
      }}
    >
      V
    </Avatar>
    <Stack direction="column" spacing={0.5}>
      <Typography variant="subtitle1" color="text.primary">
        {name}
      </Typography>
      <Typography variant="body1" color="text.primary" sx={{ opacity: 0.5 }}>
        {message}
      </Typography>
    </Stack>
  </Box>
)

interface SectionHeaderProps {
  primaryText: string
  secondaryText: string
  disableTopSpacing?: boolean
}

const SectionHeader = ({
  primaryText,
  secondaryText,
  disableTopSpacing
}: SectionHeaderProps) => (
  <>
    <Typography
      variant="h4"
      sx={{
        mt: disableTopSpacing ? 0 : 16,
        mb: 0,
        color: 'text.primary'
      }}
    >
      {primaryText}
    </Typography>
    <Typography
      variant="subtitle1"
      sx={{
        mt: 0,
        mb: 6,
        opacity: 0.5,
        color: 'text.primary'
      }}
    >
      {secondaryText}
    </Typography>
  </>
)

// New VideoPlayer component
const VideoPlayer = React.forwardRef<HTMLVideoElement, VideoPlayerProps>(
  (
    {
      videoSrc,
      poster,
      isPlaying,
      toggleMute,
      isMuted,
      handlePlayPause,
      autoPlay = false,
      id,
      onVideoClick,
      sx = {}
    },
    ref
  ) => {
    const [isHovered, setIsHovered] = useState(false)
    const [hasAutoPlayed, setHasAutoPlayed] = useState(false)
    const videoRef = useRef<HTMLVideoElement>(null)
    const { activeVideoId, setActiveVideoId } = useVideo()

    // Initial setup and autoplay
    useEffect(() => {
      if (videoRef.current) {
        if (autoPlay) {
          const playVideo = async () => {
            try {
              videoRef.current!.currentTime = 0
              await videoRef.current!.play()
            } catch (error) {
              console.log('Error auto-playing video:', error)
            }
          }
          playVideo()
        } else {
          videoRef.current.currentTime = 0.1
          videoRef.current.load()
        }
      }
    }, [autoPlay])

    // Handle video state changes
    useEffect(() => {
      if (videoRef.current && autoPlay && !hasAutoPlayed) {
        const handleCanPlay = () => {
          if (!hasAutoPlayed) {
            videoRef.current?.play()
            setActiveVideoId(id)
            setHasAutoPlayed(true)
          }
        }

        videoRef.current.addEventListener('canplay', handleCanPlay)
        return () => {
          videoRef.current?.removeEventListener('canplay', handleCanPlay)
        }
      }
    }, [autoPlay, hasAutoPlayed, id, setActiveVideoId])

    // Only pause when another video becomes active
    useEffect(() => {
      if (activeVideoId && activeVideoId !== id && videoRef.current) {
        videoRef.current.pause()
        videoRef.current.currentTime = 0.1
        setIsHovered(false)
      }
    }, [activeVideoId, id])

    const startPlaying = () => {
      if (activeVideoId !== id) {
        // Only start if not already playing
        setIsHovered(true)
        if (videoRef.current) {
          videoRef.current.currentTime = 0
          videoRef.current.play()
          setActiveVideoId(id)
        }
      }
    }

    // Modified touch handler to play immediately on touch
    const handleTouchStart = (e: React.TouchEvent) => {
      const touch = e.touches[0]
      const startY = touch.clientY
      let hasMoved = false

      const handleTouchMove = (moveEvent: TouchEvent) => {
        const currentY = moveEvent.touches[0].clientY
        const deltaY = Math.abs(currentY - startY)

        // If user has moved finger more than 10px, they're trying to scroll
        if (deltaY > 10) {
          hasMoved = true
          document.removeEventListener('touchmove', handleTouchMove)
          document.removeEventListener('touchend', handleTouchEnd)
        }
      }

      const handleTouchEnd = () => {
        document.removeEventListener('touchmove', handleTouchMove)
        document.removeEventListener('touchend', handleTouchEnd)

        // Only stop playing if the user was scrolling
        if (hasMoved && activeVideoId === id) {
          if (videoRef.current) {
            videoRef.current.pause()
            videoRef.current.currentTime = 0.1
            setActiveVideoId(null)
          }
        }
      }

      // Start playing immediately if it's not already playing
      if (!hasMoved && activeVideoId !== id) {
        startPlaying()
      }

      document.addEventListener('touchmove', handleTouchMove)
      document.addEventListener('touchend', handleTouchEnd)
    }

    const handleVideoClick = (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (onVideoClick) {
        onVideoClick(id, videoSrc)
      }
    }

    const [captionIndex, setCaptionIndex] = useState(0)
    const captions = [
      'When life feels overwhelming...',
      'In moments of doubt...',
      'Finding strength in weakness...',
      'Walking through darkness...'
    ]

    useEffect(() => {
      const timer = setInterval(() => {
        setCaptionIndex((prev) => (prev + 1) % captions.length)
      }, 3000) // Change caption every 3 seconds

      return () => clearInterval(timer)
    }, [])

    return (
      <Box
        sx={{
          width: '100%',
          maxWidth: '400px',
          aspectRatio: '9/16',
          backgroundColor: '#000',
          borderRadius: '16px',
          overflow: 'hidden',
          mb: 6,
          position: 'relative',
          ...sx // Spread additional styles
        }}
        onMouseEnter={startPlaying}
        onTouchStart={handleTouchStart}
        onClick={handleVideoClick}
      >
        <Box
          component="video"
          ref={ref || videoRef} // Use passed ref or local ref
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block'
          }}
          preload="auto"
          muted={isMuted}
          playsInline
          loop
          autoPlay={autoPlay}
        >
          <source src={videoSrc} type="video/mp4" />
          Your browser does not support the video tag.
        </Box>
        <Chip
          label="SHORT VIDEO"
          sx={{
            position: 'absolute',
            top: 16,
            left: 16,
            zIndex: 3,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            color: 'white'
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: 36,
            left: 26,
            right: 26,
            zIndex: 3,
            color: 'white',
            pointerEvents: 'none'
          }}
        >
          <motion.div
            key={captionIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <Typography
              variant="h3"
              variantMapping={{ h5: 'h3' }}
              mb={2}
              sx={{
                userSelect: 'none',
                WebkitUserSelect: 'none',
                minHeight: '3em'
              }}
            >
              {captions[captionIndex]}
            </Typography>
          </motion.div>
          <Typography
            variant="body1"
            sx={{
              userSelect: 'none',
              WebkitUserSelect: 'none'
            }}
          >
            Discover how faith and spirituality can provide comfort and strength
            during challenging times of depression.
          </Typography>
        </Box>
      </Box>
    )
  }
)

// Define props for the VideoPlayer component
interface VideoPlayerProps {
  videoSrc: string
  poster: string
  isPlaying: boolean
  toggleMute: () => void
  isMuted: boolean
  handlePlayPause: () => void
  autoPlay?: boolean
  id: string
  onVideoClick: (videoId: string, videoSrc: string) => void
  sx?: Record<string, any> // Add sx prop type
}

export function BibleVerses(): ReactElement {
  const { t } = useTranslation('apps-watch')

  const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX ?? ''

  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [bgColors, setBgColors] = useState<string[]>(['#303030', '#303030']) // Default colors

  const videoRefs = useRef<HTMLVideoElement[]>([])

  const [answerClicked, setAnswerClicked] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null)
  const [selectedVideoSrc, setSelectedVideoSrc] = useState<string>('')
  const [selectedVideoPlayer, setSelectedVideoPlayer] =
    useState<React.ReactElement | null>(null)

  const handleAnswerClick = () => {
    setAnswerClicked(true)
  }

  const handleModalClose = () => {
    setModalOpen(false)
    setSelectedVideoId(null)
  }

  useEffect(() => {
    const images = [
      'https://images.unsplash.com/photo-1619187282125-3e446e5f21fc?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTI2fHxqZXN1c3xlbnwwfHwwfHx8MA%3D%3D',
      'https://images.unsplash.com/photo-1689290018351-a0507a3036cb?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjI0fHxqZXN1c3xlbnwwfHwwfHx8MA%3D%3D',
      'https://cdn-std.droplr.net/files/acc_760170/TxsUi3'
    ]

    images.forEach((src, index) => {
      const img = new Image()
      img.crossOrigin = 'Anonymous'
      img.src = src

      img.onload = () => {
        const colorThief = new ColorThief()
        const dominantColor = colorThief.getColor(img)
        setBgColors((prevColors) => {
          const newColors = [...prevColors]
          newColors[index] = `rgb(${dominantColor.join(',')})`
          return newColors
        })
      }
    })
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement
          if (entry.isIntersecting) {
            video.play()
          } else {
            video.pause()
          }
        })
      },
      { threshold: 0.5 } // Adjust threshold as needed
    )

    videoRefs.current.forEach((video) => {
      observer.observe(video)
    })

    return () => {
      videoRefs.current.forEach((video) => {
        observer.unobserve(video)
      })
    }
  }, [])

  const handlePlayPause = () => {
    const video = document.getElementById('video-player') as HTMLVideoElement
    if (video.paused) {
      video.play()
      setIsPlaying(true)
      video.muted = false
      setIsMuted(false)
      if (video.requestFullscreen) {
        video.requestFullscreen()
      } else if (video.webkitRequestFullscreen) {
        video.webkitRequestFullscreen()
      } else if (video.msRequestFullscreen) {
        video.msRequestFullscreen()
      }
    } else {
      video.pause()
      setIsPlaying(false)
    }
  }

  const toggleMute = () => {
    const video = document.getElementById('video-player') as HTMLVideoElement
    video.muted = !video.muted
    setIsMuted(video.muted)
  }

  const animationVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  const topDownVariants = {
    hidden: { opacity: 0, y: -20 }, // Start from above
    visible: { opacity: 1, y: 0 } // Move to original position
  }

  const theme = useTheme()

  const handleVideoClick = (
    videoId: string,
    videoSrc: string,
    videoElement: React.ReactElement
  ) => {
    setModalOpen(true)
    setSelectedVideoId(videoId)
    setSelectedVideoSrc(videoSrc)
    setSelectedVideoPlayer(videoElement)
  }

  return (
    <ThemeProvider
      themeName={ThemeName.website}
      themeMode={ThemeMode.dark}
      nested
    >
      <VideoProvider>
        <Box
          sx={{ backgroundColor: 'background.default' }}
          data-testid="WatchHomePage"
        >
          <Container maxWidth="xxl" sx={{ paddingY: '4rem' }}>
            <motion.div
              initial="hidden"
              animate="visible"
              transition={{ delay: 1.2, duration: 0.75 }}
              variants={topDownVariants}
            ></motion.div>

            <motion.div
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.1, duration: 0.5 }}
              variants={animationVariants}
            >
              <SharedVideoCard
                avatarSrc="https://i.pravatar.cc/250?img=12"
                name="Jacob"
                message="shared this video with you"
              />
            </motion.div>

            <SectionHeader
              primaryText="Anxiety"
              secondaryText="Video verses from the Bible"
              disableTopSpacing
            />
            <Box
              sx={{
                minHeight: 'calc(100vw * 0.75)',
                position: 'relative'
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  transform: 'scale(0.48)',
                  transformOrigin: 'top left',
                  [theme.breakpoints.up('sm')]: { transform: 'scale(0.6)' },
                  [theme.breakpoints.up('md')]: { transform: 'scale(0.67)' },
                  [theme.breakpoints.up('lg')]: { transform: 'scale(1)' }
                }}
              >
                <VideoPlayer
                  id="video1"
                  videoSrc="https://cdn-std.droplr.net/files/acc_760170/BIVSDq"
                  poster="https://images.pexels.com/videos/9588274/pexels-photo-9588274.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500"
                  isPlaying={isPlaying}
                  toggleMute={toggleMute}
                  isMuted={isMuted}
                  handlePlayPause={handlePlayPause}
                  autoPlay={true}
                  onVideoClick={(id, src) =>
                    handleVideoClick(
                      id,
                      src,
                      <VideoPlayer
                        id={id}
                        videoSrc={src}
                        poster="https://images.pexels.com/videos/9588274/pexels-photo-9588274.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500"
                        isPlaying={isPlaying}
                        toggleMute={toggleMute}
                        isMuted={isMuted}
                        handlePlayPause={handlePlayPause}
                      />
                    )
                  }
                />
              </Box>
              <Box
                sx={{
                  position: 'absolute',
                  transform: 'scale(0.48)',
                  transformOrigin: 'top right',
                  right: 0,
                  [theme.breakpoints.up('sm')]: { transform: 'scale(0.6)' },
                  [theme.breakpoints.up('md')]: { transform: 'scale(0.67)' },
                  [theme.breakpoints.up('lg')]: { transform: 'scale(1)' }
                }}
              >
                <VideoPlayer
                  id="video2"
                  videoSrc="https://cdn-std.droplr.net/files/acc_760170/BIVSDq"
                  poster="https://images.pexels.com/videos/9588274/pexels-photo-9588274.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500"
                  isPlaying={isPlaying}
                  toggleMute={toggleMute}
                  isMuted={isMuted}
                  handlePlayPause={handlePlayPause}
                  onVideoClick={(id, src) =>
                    handleVideoClick(
                      id,
                      src,
                      <VideoPlayer
                        id={id}
                        videoSrc={src}
                        poster="https://images.pexels.com/videos/9588274/pexels-photo-9588274.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500"
                        isPlaying={isPlaying}
                        toggleMute={toggleMute}
                        isMuted={isMuted}
                        handlePlayPause={handlePlayPause}
                      />
                    )
                  }
                />
              </Box>
            </Box>
            <Box
              sx={{
                minHeight: 'calc(100vw * 0.75)',
                position: 'relative'
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  transform: 'scale(0.48)',
                  transformOrigin: 'top left',
                  [theme.breakpoints.up('sm')]: { transform: 'scale(0.6)' },
                  [theme.breakpoints.up('md')]: { transform: 'scale(0.67)' },
                  [theme.breakpoints.up('lg')]: { transform: 'scale(1)' }
                }}
              >
                <VideoPlayer
                  id="video3"
                  videoSrc="https://cdn-std.droplr.net/files/acc_760170/BIVSDq"
                  poster="https://images.pexels.com/videos/9588274/pexels-photo-9588274.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500"
                  isPlaying={isPlaying}
                  toggleMute={toggleMute}
                  isMuted={isMuted}
                  handlePlayPause={handlePlayPause}
                  onVideoClick={(id, src) =>
                    handleVideoClick(
                      id,
                      src,
                      <VideoPlayer
                        id={id}
                        videoSrc={src}
                        poster="https://images.pexels.com/videos/9588274/pexels-photo-9588274.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500"
                        isPlaying={isPlaying}
                        toggleMute={toggleMute}
                        isMuted={isMuted}
                        handlePlayPause={handlePlayPause}
                      />
                    )
                  }
                />
              </Box>
              <Box
                sx={{
                  position: 'absolute',
                  transform: 'scale(0.48)',
                  transformOrigin: 'top right',
                  right: 0,
                  [theme.breakpoints.up('sm')]: { transform: 'scale(0.6)' },
                  [theme.breakpoints.up('md')]: { transform: 'scale(0.67)' },
                  [theme.breakpoints.up('lg')]: { transform: 'scale(1)' }
                }}
              >
                <VideoPlayer
                  id="video4"
                  videoSrc="https://cdn-std.droplr.net/files/acc_760170/BIVSDq"
                  poster="https://images.pexels.com/videos/9588274/pexels-photo-9588274.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500"
                  isPlaying={isPlaying}
                  toggleMute={toggleMute}
                  isMuted={isMuted}
                  handlePlayPause={handlePlayPause}
                  onVideoClick={(id, src) =>
                    handleVideoClick(
                      id,
                      src,
                      <VideoPlayer
                        id={id}
                        videoSrc={src}
                        poster="https://images.pexels.com/videos/9588274/pexels-photo-9588274.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500"
                        isPlaying={isPlaying}
                        toggleMute={toggleMute}
                        isMuted={isMuted}
                        handlePlayPause={handlePlayPause}
                      />
                    )
                  }
                />
              </Box>
            </Box>

            <Typography
              variant="h4"
              sx={{ mt: 16, mb: 0, color: 'text.primary' }}
            >
              Emotional wounds
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{ mt: 0, mb: 6, opacity: 0.5, color: 'text.primary' }}
            >
              Identifying the Roots of Depression
            </Typography>

            <Box
              sx={{
                width: '100%',
                maxWidth: '400px',
                aspectRatio: '9/16',
                backgroundColor: '#000',
                borderRadius: '16px',
                overflow: 'hidden',
                mb: 6,
                position: 'relative',
                boxShadow: '2px 8px 8px rgba(0, 0, 0, 0.2)',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: 'inherit',
                  backdropFilter: 'blur(10px)', // Apply blur effect
                  backgroundColor: 'rgba(255, 255, 255, 0.1)', // Semi-transparent overlay
                  zIndex: 1,
                  pointerEvents: 'none',
                  mask: 'radial-gradient(transparent 60%, rgba(0,0,0,0.5) 80%, black 90%)' // Mask to leave center clear
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
                  mask: 'radial-gradient(circle, transparent 40%, black 60%)' // Mask to leave center clear
                }
              }}
            >
              <Box
                component="video"
                ref={(el) => el && videoRefs.current.push(el)}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: isPlaying ? 'none' : 'block'
                }}
                poster="https://images.pexels.com/videos/9588274/pexels-photo-9588274.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500"
                controls
                id="video-player-anxiety"
                muted
                autoPlay
                playsInline
              >
                <source
                  src="https://cdn-std.droplr.net/files/acc_760170/dzSp48"
                  type="video/mp4"
                />
                Your browser does not support the video tag.
              </Box>
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 2,
                  width: '80px',
                  height: '80px',
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  borderRadius: '50%',
                  display: isPlaying ? 'none' : 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'opacity 0.2s',
                  opacity: 1,
                  '&:hover': {
                    opacity: 0.8
                  }
                }}
                onClick={handlePlayPause}
              >
                <Box
                  sx={{
                    width: 0,
                    height: 0,
                    borderTop: '20px solid transparent',
                    borderBottom: '20px solid transparent',
                    borderLeft: '30px solid white',
                    marginLeft: '5px'
                  }}
                />
              </Box>
              <Chip
                label="TESTIMONY"
                sx={{
                  position: 'absolute',
                  top: 16,
                  left: 16,
                  zIndex: 3,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  color: 'white',
                  letterSpacing: 1
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  zIndex: 3,
                  cursor: 'pointer'
                }}
                onClick={toggleMute}
              >
                {isMuted ? (
                  <VolumeOffIcon sx={{ color: 'white' }} />
                ) : (
                  <VolumeUpIcon sx={{ color: 'white' }} />
                )}
              </Box>
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 36,
                  left: 26,
                  right: 26,
                  zIndex: 3,
                  color: 'white'
                }}
              >
                <Typography variant="overline1" sx={{ opacity: 0.5 }}>
                  Trusting God with Your Pain:
                </Typography>
                <Typography variant="h4" mb={2}>
                  Healing Emotional Scars Through Faith
                </Typography>
                <Typography variant="body1">
                  Discover how faith and spirituality can provide comfort and
                  strength during challenging times of depression.
                </Typography>
              </Box>
            </Box>

            <SectionHeader
              primaryText="Real Story, Real Emotions"
              secondaryText="Bible is shockingly honest about our condition"
            />

            <Box
              sx={{
                width: '100%',
                maxWidth: '400px',
                aspectRatio: '9/16',
                backgroundColor: '#000',
                borderRadius: '16px',
                overflow: 'hidden',
                mb: 6,
                position: 'relative',
                boxShadow: '2px 8px 8px rgba(0, 0, 0, 0.2)',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: 'inherit',
                  backdropFilter: 'blur(10px)', // Apply blur effect
                  backgroundColor: 'rgb(0 0 0 / 70%)', // Semi-transparent overlay
                  zIndex: 1,
                  pointerEvents: 'none',
                  mask: 'radial-gradient(circle at left -60%, transparent 60%, rgba(0,0,0,0.5) 80%, black 90%), radial-gradient(circle at left 80%, transparent 60%, rgba(0,0,0,0.5) 80%, black 90%) ', // Mask to leave center clear
                  boxShadow: 'inset 0 0 60px black'
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
                  boxShadow: 'inset 0 0 1px rgba(255, 255, 255, 0.3)'
                }
              }}
            >
              <Box
                component="video"
                ref={(el) => el && videoRefs.current.push(el)}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: isPlaying ? 'none' : 'block'
                }}
                poster="https://images.pexels.com/videos/9588274/pexels-photo-9588274.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500"
                controls
                id="video-player-recovery"
                muted
                autoPlay
                playsInline
              >
                <source
                  src="https://cdn-std.droplr.net/files/acc_760170/BIVSDq"
                  type="video/mp4"
                />
                Your browser does not support the video tag.
              </Box>
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 2,
                  width: '80px',
                  height: '80px',
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  borderRadius: '50%',
                  display: isPlaying ? 'none' : 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'opacity 0.2s',
                  opacity: 1,
                  '&:hover': {
                    opacity: 0.8
                  }
                }}
                onClick={handlePlayPause}
              >
                <Box
                  sx={{
                    width: 0,
                    height: 0,
                    borderTop: '20px solid transparent',
                    borderBottom: '20px solid transparent',
                    borderLeft: '30px solid white',
                    marginLeft: '5px'
                  }}
                />
              </Box>
              <Chip
                label="SHORT VIDEO"
                sx={{
                  position: 'absolute',
                  top: 16,
                  left: 16,
                  zIndex: 3,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  color: 'white'
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  zIndex: 3,
                  cursor: 'pointer'
                }}
                onClick={toggleMute}
              >
                {isMuted ? (
                  <VolumeOffIcon sx={{ color: 'white' }} />
                ) : (
                  <VolumeUpIcon sx={{ color: 'white' }} />
                )}
              </Box>
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 36,
                  left: 26,
                  right: 26,
                  zIndex: 3,
                  color: 'white'
                }}
              >
                <Typography variant="overline1" sx={{ opacity: 0.7 }}>
                  Jesus cried these words before the cross
                </Typography>
                <Typography variant="h5" variantMapping={{ h5: 'h3' }} mb={2}>
                  Let this cup <em>of sorrow</em> pass from me&hellip;
                </Typography>
                <Typography variant="body1">
                  Discover how faith and spirituality can provide comfort and
                  strength during challenging times of depression.
                </Typography>

                {/* <Typography variant="h5" sx={{ opacity: 0.8, mt: 6 }}>Did God answer to Jesus?</Typography>
                            <Box sx={{ mt: 3, maxHeight: 120, overflowY: 'auto' }}>
                                <motion.div
                                    initial={{ opacity: 1 }}
                                    animate={{ opacity: answerClicked ? 0 : 1 }}
                                    transition={{ duration: 2 }}
                                    style={{ display: answerClicked ? 'none' : 'block' }}
                                >
                                    <Stack spacing={2} direction="row" sx={{ pb: 1 }}>
                                        <Chip
                                            icon={<CheckCircleIcon />}
                                            label="Yes"
                                            variant="outlined"
                                            clickable
                                            onClick={handleAnswerClick}
                                        />
                                        <Chip
                                            icon={<CancelIcon />}
                                            label="No"
                                            variant="outlined"
                                            clickable
                                            onClick={handleAnswerClick}
                                        />
                                        <Chip
                                            icon={<HelpIcon />}
                                            label="Not sure"
                                            variant="outlined"
                                            clickable
                                            onClick={handleAnswerClick}
                                        />
                                    </Stack>
                                </motion.div>

                                {answerClicked && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 2.5 }}
                                    >
                                        <Typography variant="subtitle1" sx={{ mt: 2, mb: 3 }}>
                                            <strong>🤔 Not really.</strong> <br />Find out how it related to your expectations from God and what to expect
                                        </Typography>

                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 3.5 }}
                                        >
                                            <Chip
                                                icon={<PlayArrowIcon />}
                                                label="Watch Now"
                                                variant="outlined"
                                                clickable
                                            />
                                        </motion.div>
                                    </motion.div>
                                )}
                            </Box> */}
              </Box>
            </Box>

            <SectionHeader
              primaryText="Movies for you"
              secondaryText="Watch free with no subscription or ads"
            />

            <Swiper
              spaceBetween={20}
              slidesPerView={1.3}
              // centeredSlides={true}
              // navigation
              pagination={{ clickable: true }}
              // scrollbar={{ draggable: true }}
            >
              <SwiperSlide>
                <Box
                  sx={{
                    flex: 1,
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    borderRadius: 2,
                    position: 'relative',
                    // aspectRatio: '2/3',
                    overflow: 'hidden',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      borderRadius: 'inherit',
                      boxShadow: 'inset 0 0 1px rgba(255, 255, 255, 0.4)', // Inner glow effect
                      zIndex: 1,
                      pointerEvents: 'none'
                    }
                  }}
                >
                  <img
                    src="https://cdn-std.droplr.net/files/acc_760170/TxsUi3"
                    alt="Slide Image"
                    style={{
                      aspectRatio: '2/3',
                      width: '100%',
                      // height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                  <Button
                    variant="text"
                    size="small"
                    startIcon={<PlayArrowIcon />}
                    sx={{
                      // position: 'absolute',
                      // bottom: 8,
                      // left: 8,
                      m: 1,

                      color: 'text.primary'
                    }}
                  >
                    Watch Movie
                  </Button>
                </Box>
              </SwiperSlide>
              <SwiperSlide>
                <Box
                  sx={{
                    flex: 1,
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    borderRadius: 2,
                    position: 'relative',
                    // aspectRatio: '2/3',
                    overflow: 'hidden',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      borderRadius: 'inherit',
                      boxShadow: 'inset 0 0 1px rgba(255, 255, 255, 0.4)', // Inner glow effect
                      zIndex: 1,
                      pointerEvents: 'none'
                    }
                  }}
                >
                  <img
                    src="https://cdn-std.droplr.net/files/acc_760170/cfER11"
                    alt="Slide Image"
                    style={{
                      aspectRatio: '2/3',
                      width: '100%',
                      // height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                  <Button
                    variant="text"
                    size="small"
                    startIcon={<PlayArrowIcon />}
                    sx={{
                      // position: 'absolute',
                      // bottom: 8,
                      // left: 8,
                      m: 1,

                      color: 'text.primary'
                    }}
                  >
                    Watch Movie
                  </Button>
                </Box>
              </SwiperSlide>
              <SwiperSlide>
                <Box
                  sx={{
                    flex: 1,
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    borderRadius: 2,
                    position: 'relative',
                    // aspectRatio: '2/3',
                    overflow: 'hidden',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      borderRadius: 'inherit',
                      boxShadow: 'inset 0 0 1px rgba(255, 255, 255, 0.4)', // Inner glow effect
                      zIndex: 1,
                      pointerEvents: 'none'
                    }
                  }}
                >
                  <img
                    src="https://cdn-std.droplr.net/files/acc_760170/9wGrB0"
                    alt="Slide Image"
                    style={{
                      aspectRatio: '2/3',
                      width: '100%',
                      // height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                  <Button
                    variant="text"
                    size="small"
                    startIcon={<PlayArrowIcon />}
                    sx={{
                      // position: 'absolute',
                      // bottom: 8,
                      // left: 8,
                      m: 1,

                      color: 'text.primary'
                    }}
                  >
                    Watch Movie
                  </Button>
                </Box>
              </SwiperSlide>
            </Swiper>

            <Box
              sx={{
                overflow: 'hidden',
                position: 'relative',
                pb: 10,
                mt: 16,
                height: '100vh',
                width: '100vw', // Set full width
                ml: '-50vw', // Center the box by offsetting half of the viewport width
                left: '50%', // Center the box horizontally

                backgroundImage:
                  'url(https://cdn-std.droplr.net/files/acc_760170/kvJNRP)',
                backgroundColor: 'rgba(255,255,255,0.05)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backdropFilter: 'blur(10px)', // Apply blur effect
                  backgroundColor: 'rgba(0,0,0, 0.5)', // Semi-transparent overlay
                  zIndex: 0,
                  pointerEvents: 'none'
                  // mask: 'radial-gradient(transparent 60%, rgba(0,0,0,0.5) 80%, black 90%)', // Mask to leave center clear
                }
              }}
            >
              <img
                src="https://cdn-std.droplr.net/files/acc_760170/kvJNRP"
                alt="Slide Image"
                style={{
                  position: 'absolute',
                  zIndex: 0,
                  // aspectRatio: '2/3',
                  width: '100%',
                  height: '60vh',
                  objectFit: 'cover',
                  mask: 'linear-gradient(to bottom, black 70%, transparent 98%)' // Mask to leave center clear
                }}
              />
              <Box
                sx={{
                  p: 10,
                  mt: 10,
                  minHeight: '65vh',
                  zIndex: 2,
                  position: 'relative',
                  display: 'flex', // Add flex display
                  flexDirection: 'column', // Ensure children are stacked vertically
                  justifyContent: 'flex-end' // Align children to the bottom
                }}
              >
                <Typography
                  variant="overline"
                  sx={{ letterSpacing: 2, color: '#fff', opacity: 0.75 }}
                >
                  Video Series
                </Typography>
                <Typography
                  variant="h2"
                  sx={{ mb: 3, color: '#fff', fontWeight: 800 }}
                >
                  NUA: Fresh Perspective
                </Typography>
                <Typography
                  variant="subtitle1"
                  sx={{ mt: 0, mb: 0, opacity: 0.8, color: '#fff' }}
                >
                  Fresh Perspective Series — 15-minute episodes tackling faith,
                  science, suffering, and Jesus’ story. Start your journey with
                  NUA!
                </Typography>
              </Box>

              <Swiper
                spaceBetween={20}
                slidesPerView={1.3}
                centeredSlides={true}
                // navigation
                pagination={{ clickable: true }}
                // scrollbar={{ draggable: true }}
              >
                <SwiperSlide>
                  <Box
                    sx={{
                      flex: 1,
                      borderRadius: 2,
                      position: 'relative',
                      // aspectRatio: '2/3',
                      overflow: 'hidden',
                      height: '100%', // Ensure the Box takes full height
                      lineHeight: 0,
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        borderRadius: 'inherit',
                        boxShadow: 'inset 0 0 1px rgba(255, 255, 255, 0.4)', // Inner glow effect
                        zIndex: 1,
                        pointerEvents: 'none'
                      }
                    }}
                  >
                    <img
                      src="https://www.jesusfilm.org/_next/image?url=https%3A%2F%2Fimagedelivery.net%2FtMY86qEHFACTO8_0kAeRFA%2F7_0-nur01.mobileCinematicHigh.jpg%2Ff%3Djpg%2Cw%3D1280%2Ch%3D600%2Cq%3D95&w=2048&q=75"
                      alt="Slide Image"
                      style={{
                        // aspectRatio: '3/2',
                        width: '100%',
                        height: '200px', // Ensure the image takes full height
                        objectFit: 'cover'
                      }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 3 }}>
                    <Typography
                      variant="h3"
                      sx={{ color: '#fff', mr: 3, opacity: 0.5 }}
                    >
                      1
                    </Typography>
                    <Typography variant="subtitle1" sx={{ color: '#fff' }}>
                      Does history prove the truth of Jesus Christ?
                    </Typography>
                  </Box>
                </SwiperSlide>
                <SwiperSlide>
                  <Box
                    sx={{
                      flex: 1,
                      borderRadius: 2,
                      position: 'relative',
                      // aspectRatio: '2/3',
                      overflow: 'hidden',
                      height: '100%', // Ensure the Box takes full height
                      lineHeight: 0,
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        borderRadius: 'inherit',
                        boxShadow: 'inset 0 0 1px rgba(255, 255, 255, 0.4)', // Inner glow effect
                        zIndex: 1,
                        pointerEvents: 'none'
                      }
                    }}
                  >
                    <img
                      src="https://www.jesusfilm.org/_next/image?url=https%3A%2F%2Fimagedelivery.net%2FtMY86qEHFACTO8_0kAeRFA%2F7_0-nur02.mobileCinematicHigh.jpg%2Ff%3Djpg%2Cw%3D1280%2Ch%3D600%2Cq%3D95&w=2048&q=75"
                      alt="Slide Image"
                      style={{
                        // aspectRatio: '3/2',
                        width: '100%',
                        height: '200px', // Ensure the image takes full height
                        objectFit: 'cover'
                      }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 3 }}>
                    <Typography
                      variant="h3"
                      sx={{ color: '#fff', mr: 3, opacity: 0.5 }}
                    >
                      2
                    </Typography>
                    <Typography variant="subtitle1" sx={{ color: '#fff' }}>
                      How Can I Trust What the Bible Says?
                    </Typography>
                  </Box>
                </SwiperSlide>
                <SwiperSlide>
                  <Box
                    sx={{
                      flex: 1,
                      borderRadius: 2,
                      position: 'relative',
                      // aspectRatio: '2/3',
                      overflow: 'hidden',
                      height: '100%', // Ensure the Box takes full height
                      lineHeight: 0,
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        borderRadius: 'inherit',
                        boxShadow: 'inset 0 0 1px rgba(255, 255, 255, 0.4)', // Inner glow effect
                        zIndex: 1,
                        pointerEvents: 'none'
                      }
                    }}
                  >
                    <img
                      src="https://www.jesusfilm.org/_next/image?url=https%3A%2F%2Fimagedelivery.net%2FtMY86qEHFACTO8_0kAeRFA%2F7_0-nur03.mobileCinematicHigh.jpg%2Ff%3Djpg%2Cw%3D1280%2Ch%3D600%2Cq%3D95&w=2048&q=75"
                      alt="Slide Image"
                      style={{
                        // aspectRatio: '3/2',
                        width: '100%',
                        height: '200px', // Ensure the image takes full height
                        objectFit: 'cover'
                      }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 3 }}>
                    <Typography
                      variant="h3"
                      sx={{ color: '#fff', mr: 3, opacity: 0.5 }}
                    >
                      3
                    </Typography>
                    <Typography variant="subtitle1" sx={{ color: '#fff' }}>
                      Why Should I Believe the Bible?
                    </Typography>
                  </Box>
                </SwiperSlide>
                <SwiperSlide>
                  <Box
                    sx={{
                      flex: 1,
                      borderRadius: 2,
                      position: 'relative',
                      // aspectRatio: '2/3',
                      overflow: 'hidden',
                      height: '100%', // Ensure the Box takes full height
                      lineHeight: 0,
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        borderRadius: 'inherit',
                        boxShadow: 'inset 0 0 1px rgba(255, 255, 255, 0.4)', // Inner glow effect
                        zIndex: 1,
                        pointerEvents: 'none'
                      }
                    }}
                  >
                    <img
                      src="https://www.jesusfilm.org/_next/image?url=https%3A%2F%2Fimagedelivery.net%2FtMY86qEHFACTO8_0kAeRFA%2F7_0-nur04.mobileCinematicHigh.jpg%2Ff%3Djpg%2Cw%3D1280%2Ch%3D600%2Cq%3D95&w=2048&q=75"
                      alt="Slide Image"
                      style={{
                        // aspectRatio: '3/2',
                        width: '100%',
                        height: '200px', // Ensure the image takes full height
                        objectFit: 'cover'
                      }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 3 }}>
                    <Typography
                      variant="h3"
                      sx={{ color: '#fff', mr: 3, opacity: 0.5 }}
                    >
                      4
                    </Typography>
                    <Typography variant="subtitle1" sx={{ color: '#fff' }}>
                      How Did Jesus Die?
                    </Typography>
                  </Box>
                </SwiperSlide>
              </Swiper>
            </Box>
            <Box
              sx={{
                display: 'flex',
                width: '100%',
                alignItems: 'center',
                position: 'relative',
                py: { xs: 10, lg: 20 }
              }}
            >
              <Stack spacing={10}>
                <Typography variant="h3" component="h2" color="text.primary">
                  {t('About Our Project')}
                </Typography>
                <Stack direction="row" spacing={4}>
                  <Box
                    sx={{
                      backgroundColor: 'primary.main',
                      height: 'inherit',
                      width: { xs: 38, lg: 14 }
                    }}
                  />
                  <Typography
                    variant="subtitle2"
                    component="h3"
                    sx={{ opacity: 0.85 }}
                    color="text.primary"
                  >
                    {t(
                      'With 70% of the world not being able to speak English, there ' +
                        'is a huge opportunity for the gospel to spread to unreached ' +
                        'places. We have a vision to make it easier to watch, ' +
                        'download and share Christian videos with people in their ' +
                        'native heart language.'
                    )}
                  </Typography>
                </Stack>
                <Typography
                  variant="subtitle1"
                  component="h3"
                  sx={{ opacity: 0.8 }}
                  color="text.primary"
                >
                  {t(
                    'Jesus Film Project is a Christian ministry with a vision to ' +
                      'reach the world with the gospel of Jesus Christ through ' +
                      'evangelistic videos. Watch from over 2000 languages on any ' +
                      'device and share it with others.'
                  )}
                </Typography>
              </Stack>
            </Box>
          </Container>
        </Box>
        <VideoModal
          open={modalOpen}
          onClose={handleModalClose}
          videoId={selectedVideoId}
          videoSrc={selectedVideoSrc}
        >
          {selectedVideoPlayer}
        </VideoModal>
      </VideoProvider>
    </ThemeProvider>
  )
}
