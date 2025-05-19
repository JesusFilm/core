import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Modal from '@mui/material/Modal'
import { ReactNode } from 'react'

import ArrowLeft from '@core/shared/ui/icons/ArrowLeft'
import X2Icon from '@core/shared/ui/icons/X2'

import { useQuiz } from '../QuizProvider'
import { Intro } from '../Slides/Intro'
import { Name } from '../Slides/Name'
import { Q1 } from '../Slides/Q1'

interface QuizModalProps {
  open: boolean
  onClose: () => void
  content: ReactNode
}

export function QuizModal({ open, onClose, content }: QuizModalProps) {
  const { history, goBack } = useQuiz()
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
        <QuizContent />
      </Box>
    </Modal>
  )
}

function QuizContent() {
  const { history } = useQuiz()

  switch (history[history.length - 1]) {
    case 'intro':
      return <Intro />
    case 'name':
      return <Name />
    case 'q1':
      return <Q1 />
    default:
      return null
  }
}
