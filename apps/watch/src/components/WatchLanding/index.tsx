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
import { SectionHeader } from './SectionHeader'
import Head from 'next/head'

// import { SearchBarProvider } from '@core/journeys/ui/algolia/SearchBarProvider'
// import { SearchBar } from '@core/journeys/ui/SearchBar'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'

import { HomeHero } from './HomeHero'
import { SeeAllVideos } from './SeeAllVideos'
import { VideoSlide } from './VideoSlide'
import { HeaderSection } from './HeaderSection'

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
      padding: { xs: 4, sm: 6, md: 8 }, // Responsive padding
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
    poster:
      'https://images.pexels.com/videos/9588274/pexels-photo-9588274.jpeg',
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

export function WatchLanding(): ReactElement {
  const { t } = useTranslation('apps-watch')

  const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX ?? ''

  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [modalMuted, setModalMuted] = useState(false)
  const [bgColors, setBgColors] = useState<string[]>(['#303030', '#303030']) // Default colors

  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map())

  const [answerClicked, setAnswerClicked] = useState(false)

  const handleAnswerClick = () => {
    setAnswerClicked(true)
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

  const [sourceRect, setSourceRect] = useState<DOMRect | null>(null)

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

  const [playingVideos, setPlayingVideos] = useState<Set<string>>(new Set())

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

  const animationVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  const topDownVariants = {
    hidden: { opacity: 0, y: -20 }, // Start from above
    visible: { opacity: 1, y: 0 } // Move to original position
  }

  const [modalOpen, setModalOpen] = useState(false)
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null)
  const [selectedVideoSrc, setSelectedVideoSrc] = useState<string>('')
  const [selectedVideoPlayer, setSelectedVideoPlayer] =
    useState<ReactElement | null>(null)

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

  // Replace the previous useEffect with this one
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
        <meta property="og:type" content="video.other" />
        <meta
          property="og:title"
          content="Why Does Daniel Dream About Monsters?"
        />
        <meta
          property="og:description"
          content="Four monstrous beasts, four violent kingdoms. But then, the Son of Man arrives to conquer them all. 🔥 Dive into Daniel’s dream and its epic meaning! 📖👑"
        />
        <meta
          property="og:image"
          content="https://images.pexels.com/videos/9588274/pexels-photo-9588274.jpeg"
        />
        <meta
          property="og:video:url"
          content="https://cdn-std.droplr.net/files/acc_760170/KSluj5"
        />
        <meta
          property="og:video:secure_url"
          content="https://cdn-std.droplr.net/files/acc_760170/KSluj5"
        />
        <meta property="og:video:type" content="video/mp4" />
        <meta property="og:video:width" content="1280" />
        <meta property="og:video:height" content="720" />
      </Head>
      <ThemeProvider
        themeName={ThemeName.website}
        themeMode={ThemeMode.dark}
        //   nested
      >
        <VideoProvider>
          <Box
            sx={{ backgroundColor: 'background.default' }}
            data-testid="WatchHomePage"
          >
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

                <SectionHeader
                  primaryText="Your Next Watch"
                  secondaryText="Related videos and stories"
                  disableTopSpacing
                />
                <Swiper
                  spaceBetween={20}
                  slidesPerView={1.8}
                  // centeredSlides={true}
                  // navigation
                  pagination={{ clickable: true }}
                  // scrollbar={{ draggable: true }}
                >
                  <SwiperSlide>
                    <VideoSlide
                      imageUrl="https://images.unsplash.com/photo-1619187282125-3e446e5f21fc?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTI2fHxqZXN1c3xlbnwwfHwwfHx8MA%3D%3D"
                      title="Finding Light: A Journey Through Depression"
                      bgColor="#005B92"
                      type="Short Video"
                    />
                  </SwiperSlide>
                  <SwiperSlide>
                    <VideoSlide
                      imageUrl="https://images.unsplash.com/photo-1689290018351-a0507a3036cb?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjI0fHxqZXN1c3xlbnwwfHwwfHx8MA%3D%3D"
                      title="Hope Restored Stories of Healing and Recovery"
                      bgColor="#C26B61"
                      type="Short Video"
                    />
                  </SwiperSlide>
                </Swiper>

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

                <VideoBox
                  video={sampleVideos[1]}
                  onPlayPause={handlePlayPause}
                  onMuteToggle={toggleMute}
                  isMuted={isMuted}
                  isPlaying={playingVideos.has(sampleVideos[1].id)}
                  videoRef={(el) => {
                    if (el) {
                      videoRefs.current.set(sampleVideos[1].id, el)
                    }
                  }}
                  title="Healing Emotional Scars Through Faith"
                  subtitle="Trusting God with Your Pain:"
                  description="Discover how faith and spirituality can provide comfort and strength during challenging times of depression."
                  chipLabel="TESTIMONY"
                />

                <SectionHeader
                  primaryText="Real Story, Real Emotions"
                  secondaryText="Bible is shockingly honest about our condition"
                />

                <VideoBox
                  video={sampleVideos[2]}
                  onPlayPause={handlePlayPause}
                  onMuteToggle={toggleMute}
                  isMuted={isMuted}
                  isPlaying={playingVideos.has(sampleVideos[2].id)}
                  videoRef={(el) => {
                    if (el) {
                      videoRefs.current.set(sampleVideos[2].id, el)
                    }
                  }}
                  title="Let this cup of sorrow pass from me…"
                  subtitle="Jesus cried these words before the cross"
                  description="Discover how faith and spirituality can provide comfort and strength during challenging times of depression."
                  chipLabel="SHORT VIDEO"
                />

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
                    minHeight: '100vh',
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
                      Fresh Perspective Series — 15-minute episodes tackling
                      faith, science, suffering, and Jesus' story. Start your
                      journey with NUA!
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
                      <VideoSlide
                        imageUrl="https://www.jesusfilm.org/_next/image?url=https%3A%2F%2Fimagedelivery.net%2FtMY86qEHFACTO8_0kAeRFA%2F7_0-nur01.mobileCinematicHigh.jpg%2Ff%3Djpg%2Cw%3D1280%2Ch%3D600%2Cq%3D95&w=2048&q=75"
                        episodeNumber={1}
                        title="Does history prove the truth of Jesus Christ?"
                      />
                    </SwiperSlide>
                    <SwiperSlide>
                      <VideoSlide
                        imageUrl="https://www.jesusfilm.org/_next/image?url=https%3A%2F%2Fimagedelivery.net%2FtMY86qEHFACTO8_0kAeRFA%2F7_0-nur02.mobileCinematicHigh.jpg%2Ff%3Djpg%2Cw%3D1280%2Ch%3D600%2Cq%3D95&w=2048&q=75"
                        episodeNumber={2}
                        title="How Can I Trust What the Bible Says?"
                      />
                    </SwiperSlide>
                    <SwiperSlide>
                      <VideoSlide
                        imageUrl="https://www.jesusfilm.org/_next/image?url=https%3A%2F%2Fimagedelivery.net%2FtMY86qEHFACTO8_0kAeRFA%2F7_0-nur03.mobileCinematicHigh.jpg%2Ff%3Djpg%2Cw%3D1280%2Ch%3D600%2Cq%3D95&w=2048&q=75"
                        episodeNumber={3}
                        title="Why Should I Believe the Bible?"
                      />
                    </SwiperSlide>
                    <SwiperSlide>
                      <VideoSlide
                        imageUrl="https://www.jesusfilm.org/_next/image?url=https%3A%2F%2Fimagedelivery.net%2FtMY86qEHFACTO8_0kAeRFA%2F7_0-nur04.mobileCinematicHigh.jpg%2Ff%3Djpg%2Cw%3D1280%2Ch%3D600%2Cq%3D95&w=2048&q=75"
                        episodeNumber={4}
                        title="How Did Jesus Die?"
                      />
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
                    <Typography
                      variant="h3"
                      component="h2"
                      color="text.primary"
                    >
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
