import { Box, Chip, Typography } from '@mui/material'
import VolumeUpIcon from '@mui/icons-material/VolumeUp'
import VolumeOffIcon from '@mui/icons-material/VolumeOff'
import { type VideoContent } from '../VideoTypes'

interface VideoBoxProps {
  video: VideoContent
  onPlayPause: (video: VideoContent) => void
  onMuteToggle: () => void
  isMuted: boolean
  isPlaying: boolean
  videoRef: (el: HTMLVideoElement | null) => void
  title: string
  subtitle: string
  description: string
  chipLabel?: string
}

export function VideoBox({
  video,
  onPlayPause,
  onMuteToggle,
  isMuted,
  isPlaying,
  videoRef,
  title,
  subtitle,
  description,
  chipLabel = 'SHORT VIDEO'
}: VideoBoxProps): JSX.Element {
  return (
    <Box
      onClick={() => onPlayPause(video)}
      sx={{
        width: '100%',
        maxWidth: '400px',
        aspectRatio: '9/16',
        backgroundColor: '#000',
        borderRadius: '16px',
        overflow: 'hidden',
        mb: 6,
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
        ref={videoRef}
        sx={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
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
        autoPlay
      >
        <source src={video.src} type="video/mp4" />
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
          marginTop: '-80px',
          backdropFilter: 'brightness(0.6) blur(10px)',
          borderRadius: '50%',
          display: isPlaying ? 'none' : 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'opacity 0.2s',
          opacity: 0.7,
          '&:hover': {
            opacity: 1
          }
        }}
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
        label={chipLabel}
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
        onClick={(e) => {
          e.stopPropagation()
          onMuteToggle()
        }}
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 3,
          cursor: 'pointer'
        }}
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
          {subtitle}
        </Typography>
        <Typography variant="h5" variantMapping={{ h5: 'h3' }} mb={2}>
          {title}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            opacity: 0.7
          }}
        >
          {description}
        </Typography>
      </Box>
    </Box>
  )
}
