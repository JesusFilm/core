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
import { HeaderSection } from './HeaderSection'
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord'
import AddIcon from '@mui/icons-material/Add'
import { PersonaSlide } from './PersonaSlide'
import CreateIcon from '@mui/icons-material/Create'
import { SectionHeader } from '../SectionHeader'
import { MessageBubble } from '../MessageBubble'
import VideoVerse from '../VideoVerse'
import Drawer from '@mui/material/Drawer'
import CloseIcon from '@mui/icons-material/Close'
import TextField from '@mui/material/TextField'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import CheckIcon from '@mui/icons-material/Check'
import InputAdornment from '@mui/material/InputAdornment'
import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import StepContent from '@mui/material/StepContent'
import Paper from '@mui/material/Paper'
import NotificationsIcon from '@mui/icons-material/Notifications'
import PersonIcon from '@mui/icons-material/Person'
import LinkIcon from '@mui/icons-material/Link'
import { ShareDrawer } from '../ShareDrawer'

interface Persona {
  id: string
  name: string
  type: 'you' | 'chat' | 'email' | 'channel'
  avatarSrc: string
  unread: boolean
}

const sampleAudience: Persona[] = [
  {
    id: 'pearl',
    name: 'Pearl',
    type: 'you',
    avatarSrc:
      'https://ca.slack-edge.com/T02T11E5E-U06D18C1TJT-aaaac1765945-512',
    unread: false
  },
  {
    id: 'vlad',
    name: 'Vlad',
    type: 'chat',
    avatarSrc: '🍁',
    unread: true
  },
  {
    id: 'supporters',
    name: 'Partners',
    type: 'email',
    avatarSrc: '🤝',
    unread: true
  },
  {
    id: 'channel',
    name: 'Telegram',
    type: 'channel',
    avatarSrc: '💬',
    unread: false
  }
]

type TimedText = {
  text: string
  duration: number
}

type VideoVerse = {
  id: string
  type: VideoType
  src: string
  poster: string
  verse: TimedText[]
}

const anxietyVerses: VideoVerse[] = [
  {
    id: 'main-video',
    type: VideoType.VIDEO_VERSE,
    src: 'https://cdn-std.droplr.net/files/acc_760170/BIVSDq',
    poster: 'https://cdn-std.droplr.net/files/acc_760170/MKEjsL',
    verse: [
      { text: 'Be strong and courageous.', duration: 3 },
      { text: 'Do not be afraid', duration: 2 },
      { text: 'or terrified because of them,', duration: 2 },
      { text: 'for the LORD your God goes with you;', duration: 3 },
      { text: 'he will never leave you nor forsake you.', duration: 4 },
      { text: 'Psalm 34:4', duration: 2 }
    ]
  },
  {
    id: 'anxiety-video',
    type: VideoType.VIDEO_VERSE,
    src: 'https://cdn-std.droplr.net/files/acc_760170/XOf5fA',
    poster:
      'https://images.pexels.com/videos/9588274/pexels-photo-9588274.jpeg',
    verse: [
      { text: 'The Lord your God is with you,', duration: 3 },
      { text: 'the Mighty Warrior who saves.', duration: 3 },
      { text: 'He will take great delight in you;', duration: 3 },
      { text: 'in his love he will no longer rebuke you,', duration: 3 },
      { text: 'but will rejoice over you with singing.', duration: 3 },
      { text: 'Zephaniah 3:17', duration: 2 }
    ]
  },
  {
    id: 'come-to-me',
    type: VideoType.VIDEO_VERSE,
    src: 'https://cdn-std.droplr.net/files/acc_760170/4KaB4T',
    poster: '', // Add appropriate poster URL if available
    verse: [
      {
        text: 'Come to me, all you who are weary and burdened,',
        duration: 4
      },
      { text: 'and I will give you rest.', duration: 3 },
      { text: 'Matthew 11:28', duration: 2 }
    ]
  },
  {
    id: 'perfect-peace',
    type: VideoType.VIDEO_VERSE,
    src: 'https://cdn-std.droplr.net/files/acc_760170/kXgcec',
    poster: '', // Add appropriate poster URL if available
    verse: [
      { text: 'You will keep in perfect peace', duration: 3 },
      { text: 'those whose minds are steadfast,', duration: 3 },
      { text: 'because they trust in you.', duration: 3 },
      { text: 'Isaiah 26:2', duration: 2 }
    ]
  },
  {
    id: 'good-news',
    type: VideoType.VIDEO_VERSE,
    src: 'https://cdn-std.droplr.net/files/acc_760170/mXiLge',
    poster: '', // Add appropriate poster URL if available
    verse: [
      { text: 'The Spirit of the Lord is on me,', duration: 3 },
      {
        text: 'because he has anointed me to proclaim good news to the poor.',
        duration: 5
      },
      {
        text: 'He has sent me to proclaim freedom for the prisoners',
        duration: 4
      },
      {
        text: 'and recovery of sight for the blind, to set the oppressed free.',
        duration: 5
      },
      { text: 'Luke 4:18', duration: 2 }
    ]
  },
  {
    id: 'strength-for-the-weary',
    type: VideoType.VIDEO_VERSE,
    src: 'https://cdn-std.droplr.net/files/acc_760170/J58rjm',
    poster: '', // Add appropriate poster URL if available
    verse: [
      { text: 'He gives strength to the weary', duration: 3 },
      { text: 'and increases the power of the weak.', duration: 3 },
      { text: 'Isaiah 40:29', duration: 2 }
    ]
  }
]

interface SharedVideoCardProps {
  name: string
  message: string
}

const SharedVideoCard = ({ name, message }: SharedVideoCardProps) => (
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
        left: '155px',
        width: 0,
        height: 0,
        borderLeft: '10px solid transparent',
        borderRight: '10px solid transparent',
        borderTop: '10px solid rgba(255, 255, 255, 0.1)'
      }
    }}
  >
    <Typography
      variant="h1"
      color="text.primary"
      sx={{ fontSize: '2rem', px: 4, mr: 2 }}
    >
      👍
    </Typography>
    <Stack direction="column" spacing={0.5}>
      <Typography variant="subtitle1" color="text.primary">
        {name} <span style={{ opacity: 0.5 }}>{message}</span>
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

  // Add new state for active persona
  const [activePersonaId, setActivePersonaId] = useState('pearl')

  // Add handler for persona selection
  const handlePersonaSelect = (personaId: string) => {
    setActivePersonaId(personaId)
  }

  const handleDelete = (value: string) => {
    console.log(`Deleted ${value}`)
    // Add your delete logic here
  }

  const [isShareDrawerOpen, setIsShareDrawerOpen] = useState(false)
  const [shareMessage, setShareMessage] = useState<string>()

  const handleShareClick = (message?: string) => {
    setShareMessage(message)
    setIsShareDrawerOpen(true)
  }

  return (
    <>
      <Head>
        <title>Share this video with your friends and family</title>
        <meta
          name="description"
          content="Four monstrous beasts, four violent kingdoms. But then, the Son of Man arrives to conquer them all.  Dive into Daniel's dream and its epic meaning! 📖👑"
        />
        {/* ... (copy all the same meta tags from WatchLanding) ... */}
      </Head>
      <ThemeProvider themeName={ThemeName.website} themeMode={ThemeMode.dark}>
        <VideoProvider>
          <Box
            sx={{ backgroundColor: 'background.default' }}
            data-testid="AudiencePage"
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
                margin: '0 auto'
                // overflow: 'hidden'
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
                    name="Vlad engaged with the content"
                    message="New sharing ideas ready for you"
                  />
                </motion.div>

                <motion.div
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.1, duration: 0.5 }}
                  variants={animationVariants}
                  //   style={{ marginBottom: '2rem' }}
                >
                  <Swiper
                    // spaceBetween={6}
                    slidesPerView={3.5}
                    onSlideChange={() => console.log('slide change')}
                    onSwiper={(swiper) => console.log(swiper)}
                  >
                    {sampleAudience.map((persona, index) => (
                      <SwiperSlide
                        key={persona.id}
                        // style={{ maxWidth: '110px' }}
                      >
                        <PersonaSlide
                          persona={persona}
                          isActive={persona.id === activePersonaId}
                          unread={persona.unread}
                          onClick={() => handlePersonaSelect(persona.id)}
                        />
                      </SwiperSlide>
                    ))}
                    <SwiperSlide>
                      <PersonaSlide isAddPersona unread={false} />
                    </SwiperSlide>
                  </Swiper>
                </motion.div>

                <Box
                  sx={{
                    display: 'flex',
                    py: 4,
                    overflowX: 'auto',
                    whiteSpace: 'nowrap',
                    '&::-webkit-scrollbar': {
                      display: 'none'
                    }
                  }}
                >
                  {[
                    'Seeker',
                    'Mid-age',
                    'Male',
                    'Anxiety',
                    'Depression',
                    'Western Values'
                  ].map((value) => (
                    <Chip
                      key={value}
                      label={value}
                      variant="outlined"
                      onDelete={() => handleDelete(value)}
                      sx={{ margin: '0.5rem' }}
                    />
                  ))}

                  <Chip
                    key="edit"
                    label="Edit Interests"
                    variant="filled"
                    icon={<CreateIcon sx={{ pl: 1.5 }} />}
                    sx={{ margin: '0.5rem' }}
                  />
                </Box>

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

                <MessageBubble
                  message={[
                    "I know the Bible isn't your thing, but this video about four monstrous beasts and a 'Son of Man' might surprise you. It's different!",
                    "This video about ancient visions and crazy beasts in the Bible really caught my attention. I'd love to hear your thoughts on it.",
                    "Hey, I saw this video about Daniel dreaming of monsters—it's wild but super interesting. Thought you'd find it cool too.",
                    "There's this video about Daniel's dream—it's got wild imagery, almost like mythology. I think you'd enjoy how they explain it.",
                    "You've got to check this out—Daniel's dream of beasts and kingdoms is like a fantasy story, but with deeper meaning.",
                    "This video about Daniel's dream has some epic imagery. Even if you don't believe in it, it's pretty fascinating to watch.",
                    "I just watched this video about four beasts in the Bible—it's packed with symbolism and meaning. Wanted to share it with you!",
                    "This video on Daniel's dream really makes you think about how ancient stories connect to today. I think you'll find it interesting.",
                    "The Bible talks about beasts and someone conquering them—it's like something out of a movie. This video breaks it down really well.",
                    "I saw this video about crazy visions in the Bible—it's surprisingly gripping and thought-provoking. Let me know what you think!"
                  ]}
                  onClick={handleShareClick}
                />

                <SectionHeader
                  primaryText="Your Next Watch"
                  secondaryText="Related videos and stories"
                  disableTopSpacing
                />
                <Swiper
                  spaceBetween={20}
                  slidesPerView={2.3}
                  slidesOffsetBefore={24}
                  //   centeredSlides={true}
                  // navigation
                  pagination={{ clickable: true }}
                  // scrollbar={{ draggable: true }}

                  style={{
                    width: '100vw',
                    marginLeft: '50%',
                    transform: 'translateX(-50%)'
                  }}
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

                <SectionHeader
                  primaryText="Video Verses"
                  secondaryText="Bible Quotes Ready to Share"
                />

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '20px',
                    width: '100%',
                    height: 'auto',
                    boxSizing: 'border-box'
                  }}
                >
                  {anxietyVerses.map((verse, index) => (
                    <Box
                      sx={{
                        // aspectRatio: '9/16',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        borderRadius: 4
                      }}
                    >
                      <VideoVerse
                        videoSrc={verse.src}
                        verse={verse.verse}
                        onClick={handleShareClick}
                      />
                    </Box>
                  ))}
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

                <MessageBubble
                  message={[
                    'Hey, I just watched this video about how faith can help heal emotional scars—it really hit home. Thought you might like it too.',
                    "I know life can get heavy sometimes. This video about trusting God with pain really made me think—maybe it'll resonate with you too.",
                    "This video talks about finding comfort and strength through faith during tough times. I think it's worth watching.",
                    "I've been thinking about how we deal with pain, and this video about healing through faith made a lot of sense to me. Check it out.",
                    'This video on trusting God with emotional scars really spoke to me. I thought of you—it might give you a fresh perspective.',
                    "Hey, I saw this video on how faith can bring healing during tough times. It's powerful—I think you might like it.",
                    'Sometimes trusting God feels hard, but this video explained it in a way that really clicked for me. You might find it helpful too.',
                    'You know how life throws curveballs? This video about healing through faith was a good reminder for me—I wanted to share it with you.',
                    "This video on finding peace through faith during tough times really stuck with me. It's simple but powerful—give it a watch.",
                    'I watched this video about healing emotional scars through faith, and it really made me think about how we handle struggles. Wanted to share it with you.'
                  ]}
                  onClick={handleShareClick}
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

                <MessageBubble
                  message={[
                    "Hey, I just watched this video about Jesus' prayer before the cross—it really hit me. It's about finding strength during tough times. Thought you'd find it interesting.",
                    "This video talks about Jesus asking for the 'cup of sorrow' to pass from Him. It's powerful and really made me think about dealing with struggles.",
                    "I saw this video about Jesus' last prayer before the cross. It's about faith and finding comfort in hard times—it's worth a watch.",
                    "This video explains how Jesus faced sorrow before the cross. It's pretty deep, and it made me think about how we handle tough moments.",
                    "Jesus' words before the cross were so raw and human. This video dives into it and shows how faith can help in hard times. Check it out!",
                    "There's this video about Jesus' prayer to let the 'cup of sorrow' pass from Him. It's moving and has a lot to say about faith in hard times.",
                    "I watched this video about Jesus crying out before the cross—it's about finding strength when life feels overwhelming. I think you'd like it.",
                    "This video on Jesus' prayer before the cross shows how faith can provide comfort even in the worst moments. It's really moving—give it a watch.",
                    "If you've ever felt overwhelmed, this video about Jesus' struggle before the cross might really resonate with you. It's powerful stuff.",
                    "Jesus' words before the cross were so honest and raw. This video explains how faith helps in times of depression and pain. Thought of you!"
                  ]}
                  onClick={handleShareClick}
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
      <ShareDrawer
        open={isShareDrawerOpen}
        onClose={() => setIsShareDrawerOpen(false)}
        activePersona={sampleAudience.find((p) => p.id === activePersonaId)}
        initialMessage={shareMessage}
      />
    </>
  )
}
