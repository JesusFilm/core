import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Modal from '@mui/material/Modal'

import ArrowLeft from '@core/shared/ui/icons/ArrowLeft'
import X2Icon from '@core/shared/ui/icons/X2'

import { useQuiz } from '../QuizProvider'
import { SlideLoader } from '../Slides/SlideLoader'

interface QuizModalProps {
  open: boolean
  onClose: () => void
}

export function QuizModal({ open, onClose }: QuizModalProps) {
  const { history, goBack } = useQuiz()
  const currentSlide = history[history.length - 1]

  console.log(currentSlide)

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          height: '100vh',
          width: '100vw',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'common.white',
          position: 'relative',
          overflow: 'scroll'
        }}
      >
        <IconButton
          sx={{ position: 'fixed', top: 32, left: 32 }}
          disabled={history.length === 1}
          onClick={goBack}
        >
          <ArrowLeft />
        </IconButton>
        <IconButton
          onClick={onClose}
          sx={{ position: 'fixed', top: 32, right: 32 }}
        >
          <X2Icon />
        </IconButton>
        <SlideLoader slideId={currentSlide} />
      </Box>
    </Modal>
  )
}
