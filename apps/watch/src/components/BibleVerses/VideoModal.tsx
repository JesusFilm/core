import { Dialog, IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import Box from '@mui/material/Box'
import { useEffect, useRef, cloneElement } from 'react'

interface VideoModalProps {
  open: boolean
  onClose: () => void
  videoId: string | null
  videoSrc?: string
  children?: React.ReactElement
}

export function VideoModal({
  open,
  onClose,
  videoId,
  videoSrc,
  children
}: VideoModalProps): JSX.Element {
  const videoRef = useRef<HTMLVideoElement>(null)

  // Reset and play video when modal opens
  useEffect(() => {
    const playVideo = async () => {
      if (videoRef.current) {
        try {
          videoRef.current.currentTime = 0
          await videoRef.current.play()
        } catch (error) {
          console.log('Error playing video:', error)
        }
      }
    }

    if (open) {
      // Try playing immediately and also with a small delay as fallback
      playVideo()
      setTimeout(playVideo, 100)
    }
  }, [open])

  // Handle click events inside modal
  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={onClose}
      onClick={handleModalClick}
      TransitionProps={{
        onEntered: () => {
          // Try playing video after transition completes
          if (videoRef.current) {
            videoRef.current.play()
          }
        }
      }}
      sx={{
        '& .MuiDialog-paper': {
          backgroundColor: '#000'
        }
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2
        }}
      >
        {children &&
          cloneElement(children, {
            ref: videoRef,
            onVideoClick: undefined,
            autoPlay: true, // Force autoplay in modal
            muted: false, // Unmute in modal
            sx: {
              ...children.props.sx,
              width: '100%',
              maxWidth: '100%',
              height: '100%',
              maxHeight: '100vh',
              m: 0
            }
          })}
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 16,
            top: 16,
            color: 'white',
            zIndex: 2
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>
    </Dialog>
  )
}
