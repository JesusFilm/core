import React, {
  ReactElement,
  useRef,
  useEffect,
  useState,
  useCallback
} from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { VideoType, type VideoContent } from '../VideoTypes'
import { CustomControls } from './CustomControls'

interface VideoPlayerProps {
  video: VideoContent
  onVideoClick?: (video: VideoContent, rect: DOMRect) => void
  autoPlay?: boolean
  muted?: boolean
  controls?: boolean
  isModal?: boolean
  onMuteToggle?: () => void
}

export function VideoPlayer({
  video,
  onVideoClick,
  autoPlay = false,
  muted = true,
  controls = false,
  isModal = false,
  onMuteToggle
}: VideoPlayerProps): ReactElement {
  const isVertical =
    video.type === VideoType.VERTICAL_CLIP ||
    video.type === VideoType.VIDEO_VERSE
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [videoReady, setVideoReady] = useState(false)
  const [isMuted, setIsMuted] = useState(muted)
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(
    null
  )

  // Add unique ID for each video instance
  const videoId = `video-${video.id}-${isModal ? 'modal' : 'inline'}`

  useEffect(() => {
    const videoElement = videoRef.current
    if (videoElement) {
      const handleLoadedMetadata = () => {
        console.log('Video metadata loaded')
        setVideoReady(true)
      }

      videoElement.addEventListener('loadedmetadata', handleLoadedMetadata)

      // If the video is already loaded, set ready state
      if (videoElement.readyState >= 1) {
        setVideoReady(true)
      }

      return () => {
        videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata)
      }
    }
  }, [])

  // Add volume change listener
  useEffect(() => {
    const videoElement = videoRef.current
    if (videoElement) {
      const handleVolumeChange = () => {
        setIsMuted(videoElement.muted)
      }

      videoElement.addEventListener('volumechange', handleVolumeChange)
      return () => {
        videoElement.removeEventListener('volumechange', handleVolumeChange)
      }
    }
  }, [])

  // Update mute state when modal opens
  useEffect(() => {
    if (isModal && videoRef.current) {
      videoRef.current.muted = false
      setIsMuted(false)
    }
  }, [isModal])

  useEffect(() => {
    const element = document.getElementById(videoId) as HTMLVideoElement
    if (element) {
      setVideoElement(element)
    }
  }, [videoId])

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isModal && onVideoClick && containerRef.current) {
      if (videoRef.current) {
        videoRef.current.pause()
      }
      const rect = containerRef.current.getBoundingClientRect()
      onVideoClick(video, rect)
    } else if (isModal && videoRef.current) {
      // Toggle play/pause when clicking video in modal
      if (videoRef.current.paused) {
        videoRef.current.play()
      } else {
        videoRef.current.pause()
      }
    }
  }

  const handleMuteToggle = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted
      setIsMuted(videoRef.current.muted)
      onMuteToggle?.() // Call parent handler if provided
    }
  }, [onMuteToggle])

  return (
    <Box sx={{ position: 'relative' }}>
      <Box
        ref={containerRef}
        sx={{
          ...(isModal && (isVertical || video.type === VideoType.VIDEO_VERSE)
            ? {
                height: '80vh',
                width: '100vw',
                maxWidth: '100vw',
                aspectRatio: '9/16',
                borderRadius: 0,
                padding: 0,
                mt: 0
              }
            : {
                width: '100%',
                aspectRatio: isVertical ? '9/16' : '16/9',
                borderRadius: '16px'
              }),
          position: 'relative',
          backgroundColor: '#000',
          overflow: 'visible',
          cursor: isModal ? 'default' : 'pointer',
          margin: isModal ? 0 : '0 auto'
        }}
        onClick={handleClick}
      >
        <Box
          component="video"
          id={videoId}
          ref={videoRef}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            position: 'relative',
            zIndex: 1,
            borderRadius: isModal ? 0 : '16px',
            overflow: 'hidden',
            '&::-webkit-media-controls': {
              display: 'none !important'
            },
            '&::-webkit-media-controls-enclosure': {
              display: 'none !important'
            }
          }}
          autoPlay={autoPlay}
          muted={isMuted}
          controls={false}
          playsInline
          webkit-playsinline="true"
          x-webkit-airplay="deny"
          disablePictureInPicture
          controlsList="nodownload nofullscreen noremoteplayback"
          onLoadedMetadata={() => setVideoReady(true)}
        >
          <source src={video.src} type="video/mp4" />
        </Box>

        {isModal && videoElement && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 2
            }}
          >
            <CustomControls
              key={videoId}
              video={videoElement}
              isHorizontal={video.type === VideoType.HORIZONTAL_CLIP}
              videoId={videoId}
            />
          </Box>
        )}

        {!isModal && video.type === VideoType.VIDEO_VERSE && video.verse && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: 3,
              background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
              color: 'white',
              textAlign: 'center'
            }}
          >
            <Typography
              variant="h5"
              sx={{
                mb: 2,
                fontStyle: 'italic',
                textShadow: '0 2px 4px rgba(0,0,0,0.5)'
              }}
            >
              "{video.verse.text}"
            </Typography>
            <Typography variant="subtitle1" sx={{ opacity: 0.8 }}>
              {video.verse.reference}
            </Typography>
          </Box>
        )}
      </Box>

      {isModal && (
        <Box
          sx={{
            width: '100%',
            padding: 6,
            background: '#000',
            color: 'white'
          }}
        >
          <Typography variant="overline1" sx={{ opacity: 0.7 }}>
            {video.type === VideoType.VIDEO_VERSE
              ? 'Jesus cried these words before the cross'
              : 'Dragons in the Bible'}
          </Typography>
          <Typography
            variant={video.type === VideoType.VIDEO_VERSE ? 'h5' : 'h4'}
            variantMapping={
              video.type === VideoType.VIDEO_VERSE ? { h5: 'h3' } : undefined
            }
            mb={2}
          >
            {video.title}
          </Typography>
          <Typography variant="body1">{video.description}</Typography>
        </Box>
      )}
    </Box>
  )
}
