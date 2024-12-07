import React, { ReactElement, useRef, useEffect } from 'react'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import VolumeOffIcon from '@mui/icons-material/VolumeOff'
import VolumeUpIcon from '@mui/icons-material/VolumeUp'

interface VideoModalProps {
  open: boolean
  onClose: () => void
  videoId: string | null
  videoSrc: string
  children?: ReactElement
  sourceRect?: DOMRect | null
  onMuteClick: () => void
  isMuted: boolean
}

export function VideoModal({
  open,
  onClose,
  videoId,
  videoSrc,
  children,
  sourceRect,
  onMuteClick,
  isMuted
}: VideoModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const dragConstraintsRef = useRef<HTMLDivElement>(null)

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

  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    // Close modal if dragged down more than 100px
    if (info.offset.y > 100) {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              zIndex: 1300
            }}
            onClick={onClose}
          />

          <div
            ref={dragConstraintsRef}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1301,
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
              padding: 0
            }}
          >
            <motion.div
              ref={modalRef}
              drag="y"
              dragConstraints={dragConstraintsRef}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
              dragSnapToOrigin
              initial={{
                position: 'absolute',
                top: sourceRect?.top,
                left: sourceRect?.left,
                width: sourceRect?.width,
                height: sourceRect?.height,
                transform: 'none'
              }}
              animate={{
                position: 'relative',
                top: 'auto',
                left: 'auto',
                width: '100vw',
                height: '80vh',
                transform: 'none'
              }}
              exit={{
                position: 'absolute',
                top: sourceRect?.top,
                left: sourceRect?.left,
                width: sourceRect?.width,
                height: sourceRect?.height,
                transform: 'none'
              }}
              transition={{
                duration: 0.3,
                ease: [0.43, 0.13, 0.23, 0.96]
              }}
              style={{
                borderRadius: 0,
                overflow: 'hidden',
                cursor: 'grab',
                touchAction: 'none',
                pointerEvents: 'auto'
              }}
            >
              {children}
            </motion.div>
          </div>

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
                color: 'white',
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                zIndex: 1302,
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.6)'
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
              onClick={onMuteClick}
              sx={{
                position: 'fixed',
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
        </>
      )}
    </AnimatePresence>
  )
}
