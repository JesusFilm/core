import React, { ReactElement, useEffect, useState, TouchEvent } from 'react'

import IconButton from '@mui/material/IconButton'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import VolumeOffIcon from '@mui/icons-material/VolumeOff'
import VolumeUpIcon from '@mui/icons-material/VolumeUp'
import { Drawer } from '@mui/material'
import { Swiper, SwiperSlide } from 'swiper/react'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { ButtonBase } from '@mui/material'
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined'
import IosShareIcon from '@mui/icons-material/IosShare'
import { styled } from '@mui/material/styles'
import { VideoSlide } from './WatchLanding/VideoSlide'
import { SectionHeader } from './SectionHeader'

interface VideoSingleProps {
  open: boolean
  onClose: () => void
  videoId: string | null
  videoSrc: string
  children?: ReactElement
  sourceRect?: DOMRect | null
  onMuteClick: () => void
  isMuted: boolean
}

const OverscrollText = styled(Typography)(({ theme }) => ({
  position: 'fixed',
  top: '36px',
  left: 0,
  width: '100%',
  textAlign: 'center',
  color: 'rgba(255, 255, 255, 0.7)',
  fontSize: '0.875rem',
  pointerEvents: 'none',
  zIndex: -1,
  transform: 'translateY(-50%)'
}))

export function VideoSingle({
  open,
  onClose,
  videoId,
  videoSrc,
  children,
  sourceRect,
  onMuteClick,
  isMuted
}: VideoSingleProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out this video',
          text: 'I thought you might find this interesting',
          url: window.location.href
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    }
  }

  const handleMuteToggle = () => {
    const videoElement = document.getElementById(
      `video-${videoId}-modal`
    ) as HTMLVideoElement
    if (videoElement) {
      onMuteClick() // Call parent handler first
    }
  }

  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [overscrollAmount, setOverscrollAmount] = useState(0)
  const [scrollY, setScrollY] = useState(0)
  const [videoHeight, setVideoHeight] = useState(0)
  const [isVideoOutOfView, setIsVideoOutOfView] = useState(false)

  const handleTouchStart = (e: TouchEvent) => {
    setTouchStart(e.touches[0].clientY)
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (!touchStart) return

    const currentTouch = e.touches[0].clientY
    const diff = currentTouch - touchStart

    if (scrollY < 200) {
      if (diff > 220) {
        onClose()
        setTouchStart(null)
      }
      setOverscrollAmount(Math.max(0, diff))
    }
  }

  const handleTouchEnd = () => {
    setTouchStart(null)
    setOverscrollAmount(0)
  }

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement
    const currentScrollY = target.scrollTop
    setScrollY(currentScrollY)

    // Check if video is out of view (adding some buffer for better UX)
    setIsVideoOutOfView(currentScrollY > videoHeight - 20)
  }

  useEffect(() => {
    if (open) {
      // Give a small delay to ensure DOM is ready
      const timeoutId = setTimeout(() => {
        const videoElement = document.getElementById(`video-${videoId}-modal`)
        if (videoElement) {
          // Create a ResizeObserver to track video height changes
          const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
              const height = entry.contentRect.height
              if (height > 0) {
                setVideoHeight(height)
                console.log('Video height updated:', height) // Debug log
              }
            }
          })

          resizeObserver.observe(videoElement)

          // Initial measurement
          const initialHeight = videoElement.offsetHeight
          if (initialHeight > 0) {
            setVideoHeight(initialHeight)
            console.log('Initial video height:', initialHeight) // Debug log
          }

          // Cleanup
          return () => {
            resizeObserver.disconnect()
          }
        } else {
          console.warn('Video element not found:', `video-${videoId}-modal`) // Debug log
        }
      }, 100)

      return () => clearTimeout(timeoutId)
    }
  }, [open, videoId])

  // Add this debug useEffect
  useEffect(() => {
    console.log('Current video height state:', videoHeight) // Debug log
  }, [videoHeight])

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      variant="temporary"
      PaperProps={{
        onTouchStart: handleTouchStart,
        onTouchMove: handleTouchMove,
        onTouchEnd: handleTouchEnd,
        onScroll: handleScroll,
        sx: {
          backgroundColor: 'background.default',

          backgroundImage: 'none',
          WebkitOverflowScrolling: 'touch',
          position: 'relative',
          zIndex: 1,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'background.default',
            zIndex: 0
          }
        }
      }}
      sx={{
        '& .MuiDrawer-paper': {
          width: '100%',
          maxWidth: '100%'
        }
      }}
    >
      <OverscrollText
        style={{
          opacity: isVideoOutOfView ? 0 : 0.7
        }}
      >
        Swipe down to close
      </OverscrollText>

      {children}

      <Box
        sx={{
          flex: 1,
          width: '100%',
          position: 'relative'
        }}
      >
        <SectionHeader
          primaryText="Your Next Watch"
          secondaryText="Related videos and stories"
          //   disableTopSpacing
          sx={{
            px: 6
          }}
        />

        <Swiper
          spaceBetween={20}
          slidesPerView={1.8}
          initialSlide={0}
          slidesOffsetBefore={24}
          slidesOffsetAfter={24}
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

        {/* Questions Section */}
        <Box sx={{ py: 8 }}>
          <SectionHeader
            primaryText="Other People Ask"
            secondaryText="Questions about faith"
            //   disableTopSpacing
            sx={{
              px: 6
            }}
          />

          {/* Questions List */}
          <Box sx={{ mb: 6 }}>
            {[
              "How can I trust in God's sovereignty when the world feels so chaotic?",
              "What does God's ultimate justice mean for my struggles and the injustices I see around me?",
              "How can I make sure I'm living in a way that aligns with God's eternal kingdom?",
              'What does it mean for me personally that Jesus is the Son of Man who will rule forever?',
              "How does this vision give me hope for God's ultimate victory over the struggles I face?"
            ].map((question, index) => (
              <ButtonBase
                key={index}
                component="a"
                href="#"
                sx={{
                  width: '100%',
                  textAlign: 'left',
                  borderBottom: '1px solid rgba(255,255,255,0.1)',
                  '&:last-child': {
                    borderBottom: 'none'
                  },
                  transition: 'background-color 0.2s',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.05)'
                  }
                }}
              >
                <motion.div
                  style={{ width: '100%' }}
                  whileHover="hover"
                  initial="rest"
                  variants={{
                    rest: {
                      backgroundColor: 'transparent'
                    },
                    hover: {
                      backgroundColor: 'rgba(255,255,255,0.05)'
                    }
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      py: 4,
                      px: 8,
                      width: '100%'
                    }}
                  >
                    <Typography
                      variant="body1"
                      sx={{
                        color: 'white',
                        opacity: 0.9,
                        flex: 1,
                        pr: 4
                      }}
                    >
                      {question}
                    </Typography>
                    <motion.div
                      variants={{
                        rest: { x: 0 },
                        hover: {
                          x: [0, 5, 0],
                          transition: {
                            duration: 1,
                            repeat: Infinity,
                            ease: 'easeInOut'
                          }
                        }
                      }}
                    >
                      <IconButton
                        sx={{
                          color: 'white',
                          backgroundColor: 'transparent',
                          marginLeft: 2,
                          '&:hover': {
                            backgroundColor: 'transparent'
                          }
                        }}
                      >
                        <ArrowForwardIcon />
                      </IconButton>
                    </motion.div>
                  </Box>
                </motion.div>
              </ButtonBase>
            ))}
          </Box>
        </Box>

        {/* Related Videos Section */}
        <Box sx={{ py: 8 }}>
          <Typography variant="h5" sx={{ mb: 2, color: 'white', px: 8 }}>
            Keep Exploring
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{ mb: 4, color: 'white', opacity: 0.7, px: 8 }}
          >
            Watch similar videos
          </Typography>

          <Swiper
            spaceBetween={20}
            slidesOffsetBefore={24}
            slidesPerView={1.3}
            pagination={{ clickable: true }}
            style={{ padding: '0 8px' }}
          >
            <SwiperSlide>
              <Box
                sx={{
                  flex: 1,
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderRadius: 2,
                  position: 'relative',
                  overflow: 'hidden',
                  minHeight: '100px',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderRadius: 'inherit',
                    boxShadow: 'inset 0 0 1px rgba(255, 255, 255, 0.4)',
                    zIndex: 1,
                    pointerEvents: 'none'
                  }
                }}
              >
                <img
                  src="https://www.jesusfilm.org/_next/image?url=https%3A%2F%2Fimagedelivery.net%2FtMY86qEHFACTO8_0kAeRFA%2F7_0-nur01.mobileCinematicHigh.jpg%2Ff%3Djpg%2Cw%3D1280%2Ch%3D600%2Cq%3D95&w=2048&q=75"
                  alt="Related Video"
                  style={{
                    width: '100%',
                    height: '100%',
                    minHeight: '100px',
                    objectFit: 'cover'
                  }}
                />
                <Button
                  variant="text"
                  size="small"
                  startIcon={<PlayArrowIcon />}
                  sx={{
                    m: 1,
                    color: 'white'
                  }}
                >
                  Watch Video
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
                  overflow: 'hidden',
                  minHeight: '100px',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderRadius: 'inherit',
                    boxShadow: 'inset 0 0 1px rgba(255, 255, 255, 0.4)',
                    zIndex: 1,
                    pointerEvents: 'none'
                  }
                }}
              >
                <img
                  src="https://www.jesusfilm.org/_next/image?url=https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/4_Injury2AskingWhy.mobileCinematicHigh.jpg/f%3Djpg,w%3D1280,h%3D600,q%3D95&w=3840&q=75"
                  alt="Related Video"
                  style={{
                    width: '100%',
                    height: '100%',
                    minHeight: '100px',
                    objectFit: 'cover'
                  }}
                />
                <Button
                  variant="text"
                  size="small"
                  startIcon={<PlayArrowIcon />}
                  sx={{
                    m: 1,
                    color: 'white'
                  }}
                >
                  Watch Video
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
                  overflow: 'hidden',
                  minHeight: '100px',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderRadius: 'inherit',
                    boxShadow: 'inset 0 0 1px rgba(255, 255, 255, 0.4)',
                    zIndex: 1,
                    pointerEvents: 'none'
                  }
                }}
              >
                <img
                  src="https://www.jesusfilm.org/_next/image?url=https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/8_NBC10.mobileCinematicHigh.jpg/f%3Djpg,w%3D1280,h%3D600,q%3D95&w=3840&q=75"
                  alt="Related Video"
                  style={{
                    width: '100%',
                    height: '100%',
                    minHeight: '100px',
                    objectFit: 'cover'
                  }}
                />
                <Button
                  variant="text"
                  size="small"
                  startIcon={<PlayArrowIcon />}
                  sx={{
                    m: 1,
                    color: 'white'
                  }}
                >
                  Watch Video
                </Button>
              </Box>
            </SwiperSlide>
          </Swiper>

          {/* Share Button */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              py: 24
            }}
          >
            <Button
              variant="contained"
              size="large"
              startIcon={<IosShareIcon />}
              onClick={handleShare}
              sx={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                color: 'white',
                padding: '16px 32px',
                borderRadius: '12px',
                textTransform: 'none',
                fontSize: '1rem',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.2)'
                }
              }}
            >
              Share with a friend
            </Button>
          </Box>
        </Box>
      </Box>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, delay: 0.1 }}
      >
        <IconButton
          onClick={onClose}
          sx={{
            position: 'fixed',
            left: 16,
            top: 16,
            color: isVideoOutOfView ? 'black' : 'white',
            backgroundColor: isVideoOutOfView
              ? 'rgba(255, 255, 255, 1)'
              : 'rgba(0, 0, 0, 0.4)',
            zIndex: 1302,
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: isVideoOutOfView
                ? 'rgba(255, 255, 255, 0.8)'
                : 'rgba(0, 0, 0, 0.6)'
            }
          }}
        >
          <ArrowBackIcon />
        </IconButton>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, delay: 0.1 }}
      >
        <IconButton
          onClick={handleMuteToggle}
          sx={{
            position: 'absolute',
            right: 16,
            top: 16,
            color: 'white',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            zIndex: 1302,
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.6)'
            }
          }}
        >
          {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
        </IconButton>
      </motion.div>
    </Drawer>
  )
}
