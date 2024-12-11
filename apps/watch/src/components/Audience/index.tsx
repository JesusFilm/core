import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import SearchIcon from '@mui/icons-material/Search'
import IconButton from '@mui/material/IconButton'
import { useTranslation } from 'next-i18next'
import { type ReactElement, useState, useEffect, useRef } from 'react'
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
import { VideoSingle } from '../VideoSingle'
import { VideoProvider, useVideo } from '../VideoContext'
import { VideoType, type VideoContent } from '../VideoTypes'
import { VideoPlayer } from '../VideoPlayer'
import { VideoBox } from '../VideoBox'
import Head from 'next/head'

import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'

import { VideoSlide } from '../WatchLanding/VideoSlide'
import { HeaderSection } from '../WatchLanding/HeaderSection'

// Copy all the component definitions and helper functions from WatchLanding
// (SharedVideoCard, DesktopMessage, sampleVideos, etc.)

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

const MOBILE_MAX_WIDTH = 440

const DesktopMessage = () => (
  <Box
    sx={{
      height: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'background.default',
      padding: { xs: 4, sm: 6, md: 8 },
      textAlign: 'center'
    }}
  >
    <Box
      sx={{
        maxWidth: 600,
        padding: { xs: 4, sm: 6, md: 8 },
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.1)'
      }}
    >
      <Typography variant="h5" color="text.primary" sx={{ mb: 3 }}>
        This is a prototype for a mobile device.
      </Typography>
      <Typography variant="body1" sx={{ opacity: 0.7, color: '#fff' }}>
        Current screen size is not supported.
      </Typography>
    </Box>
  </Box>
)

// Add sample video data
const sampleVideos: VideoContent[] = [
  {
    id: 'main-video',
    type: VideoType.VERTICAL_CLIP,
    src: 'https://cdn-std.droplr.net/files/acc_760170/KSluj5',
    poster: 'https://cdn-std.droplr.net/files/acc_760170/MKEjsL',
    title: 'Why Does Daniel Dream About Monsters?',
    description:
      "The four monstrous beasts in Daniel's dream represent four violent kingdoms. Daniel's dream continues with the arrival of the Son of Man, who shows up to destroy the beasts."
  },
  {
    id: 'anxiety-video',
    type: VideoType.VIDEO_VERSE,
    src: 'https://cdn-std.droplr.net/files/acc_760170/dzSp48',
    poster:
      'https://images.pexels.com/videos/9588274/pexels-photo-9588274.jpeg',
    title: 'Healing Emotional Scars Through Faith',
    description:
      'Discover how faith and spirituality can provide comfort and strength during challenging times of depression.',
    verse: {
      text: 'Cast all your anxiety on him because he cares for you',
      reference: '1 Peter 5:7'
    }
  },
  {
    id: 'recovery-video',
    type: VideoType.VIDEO_VERSE,
    src: 'https://cdn-std.droplr.net/files/acc_760170/BIVSDq',
    poster:
      'https://images.pexels.com/videos/9588274/pexels-photo-9588274.jpeg',
    title: 'Let this cup of sorrow pass from me',
    description:
      'Discover how faith and spirituality can provide comfort and strength during challenging times of depression.',
    verse: {
      text: 'Let this cup of sorrow pass from me',
      reference: 'Matthew 26:39'
    }
  }
]

export function Audience(): ReactElement {
  // Copy all the same hooks and state from WatchLanding
  const { t } = useTranslation('apps-watch')
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [modalMuted, setModalMuted] = useState(false)
  const [bgColors, setBgColors] = useState<string[]>(['#303030', '#303030'])
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map())
  const [answerClicked, setAnswerClicked] = useState(false)
  // ... (copy all the same state and hooks from WatchLanding)

  // Copy all the same handler functions from WatchLanding
  const handleAnswerClick = () => {
    setAnswerClicked(true)
  }

  const animationVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  const topDownVariants = {
    hidden: { opacity: 0, y: -20 }, // Start from above
    visible: { opacity: 1, y: 0 } // Move to original position
  }

  // ... (copy all the same handler functions from WatchLanding)

  const [sourceRect, setSourceRect] = useState<DOMRect | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null)
  const [selectedVideoSrc, setSelectedVideoSrc] = useState<string>('')
  const [selectedVideoPlayer, setSelectedVideoPlayer] =
    useState<ReactElement | null>(null)
  const [playingVideos, setPlayingVideos] = useState<Set<string>>(new Set())

  const handleVideoClick = (
    video: VideoContent,
    rect: DOMRect,
    videoElement: ReactElement
  ) => {
    setSourceRect(rect)
    setModalOpen(true)
    setSelectedVideoId(video.id)
    setSelectedVideoSrc(video.src)
    setSelectedVideoPlayer(videoElement)
  }

  const handlePlayPause = (video: VideoContent) => {
    const videoElement = videoRefs.current.get(video.id)
    if (videoElement) {
      handleVideoClick(
        video,
        videoElement.getBoundingClientRect(),
        <VideoPlayer
          video={video}
          autoPlay
          muted={false}
          isModal={true}
          onMuteToggle={handleMuteToggle}
        />
      )
      setModalMuted(false)
    }
  }

  const toggleMute = () => {
    const videoElement = videoRefs.current.get(sampleVideos[0].id)
    if (videoElement) {
      handleVideoClick(
        sampleVideos[0],
        videoElement.getBoundingClientRect(),
        <VideoPlayer
          video={sampleVideos[0]}
          autoPlay
          muted={false}
          isModal={true}
          onMuteToggle={handleMuteToggle}
        />
      )
      setModalMuted(false)
    }
  }

  const handleModalClose = () => {
    setModalOpen(false)
    setSelectedVideoId(null)
    setModalMuted(false)
  }

  const handleMuteToggle = () => {
    if (selectedVideoId) {
      const videoElement = document.getElementById(
        `video-${selectedVideoId}-modal`
      ) as HTMLVideoElement
      if (videoElement) {
        videoElement.muted = !videoElement.muted
        setModalMuted(videoElement.muted)
      }
    }
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
    const videoElements = Array.from(videoRefs.current.entries())

    const handlePlay = (videoId: string) => () => {
      setPlayingVideos((prev) => new Set(prev).add(videoId))
    }

    const handlePause = (videoId: string) => () => {
      setPlayingVideos((prev) => {
        const newSet = new Set(prev)
        newSet.delete(videoId)
        return newSet
      })
    }

    videoElements.forEach(([videoId, video]) => {
      video.addEventListener('play', handlePlay(videoId))
      video.addEventListener('pause', handlePause(videoId))
    })

    return () => {
      videoElements.forEach(([videoId, video]) => {
        video.removeEventListener('play', handlePlay(videoId))
        video.removeEventListener('pause', handlePause(videoId))
      })
    }
  }, [])

  return (
    <>
      <Head>
        <title>Share this video with your friends and family</title>
        <meta
          name="description"
          content="Four monstrous beasts, four violent kingdoms. But then, the Son of Man arrives to conquer them all. 🔥 Dive into Daniel's dream and its epic meaning! 📖👑"
        />
        {/* ... (copy all the same meta tags from WatchLanding) ... */}
      </Head>
      <ThemeProvider themeName={ThemeName.website} themeMode={ThemeMode.dark}>
        <VideoProvider>
          <Box
            sx={{ backgroundColor: 'background.default' }}
            data-testid="AudiencePage"
          >
            {/* Copy the same JSX structure from WatchLanding */}
            {/* Desktop Message */}
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <DesktopMessage />
            </Box>

            {/* Mobile Content */}
            <Box
              sx={{
                display: { xs: 'block', sm: 'none' },
                maxWidth: MOBILE_MAX_WIDTH,
                margin: '0 auto',
                overflow: 'hidden'
              }}
            >
              <Container sx={{ paddingY: '4rem' }}>
                <motion.div
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 1.2, duration: 0.75 }}
                  variants={topDownVariants}
                >
                  <HeaderSection />
                </motion.div>

                <motion.div
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.1, duration: 0.5 }}
                  variants={animationVariants}
                >
                  <SharedVideoCard
                    avatarSrc="https://ca.slack-edge.com/T02T11E5E-U06D18C1TJT-aaaac1765945-512"
                    name="Pearl"
                    message="shared this video with you"
                  />
                </motion.div>

                <VideoBox
                  video={sampleVideos[0]}
                  onPlayPause={handlePlayPause}
                  onMuteToggle={toggleMute}
                  isMuted={isMuted}
                  isPlaying={playingVideos.has(sampleVideos[0].id)}
                  videoRef={(el) => {
                    if (el) {
                      videoRefs.current.set(sampleVideos[0].id, el)
                    }
                  }}
                  title={sampleVideos[0].title ?? ''}
                  subtitle="Dragons in the Bible"
                  description={sampleVideos[0].description ?? ''}
                  chipLabel="NEW SHOW"
                />

                {/* ... Continue with the rest of the mobile content ... */}
              </Container>
            </Box>
            <VideoSingle
              open={modalOpen}
              onClose={handleModalClose}
              videoId={selectedVideoId}
              videoSrc={selectedVideoSrc}
              sourceRect={sourceRect}
              onMuteClick={handleMuteToggle}
              isMuted={modalMuted}
              disableDrag
            >
              {selectedVideoPlayer}
            </VideoSingle>
          </Box>
        </VideoProvider>
      </ThemeProvider>
    </>
  )
}
