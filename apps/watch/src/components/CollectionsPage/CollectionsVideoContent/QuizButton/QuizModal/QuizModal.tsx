import CloseIcon from '@mui/icons-material/Close'
import Dialog from '@mui/material/Dialog'
import IconButton from '@mui/material/IconButton'
import Slide from '@mui/material/Slide'
import { TransitionProps } from '@mui/material/transitions'
import { ReactElement, Ref, forwardRef } from 'react'

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: ReactElement
  },
  ref: Ref<unknown>
) {
  return <Slide direction="left" ref={ref} {...props} />
})

interface QuizModalProps {
  open: boolean
  onClose: () => void
}

export function QuizModal({ open, onClose }: QuizModalProps): ReactElement {
  const handleClose = (): void => {
    onClose()
  }

  return (
    <Dialog
      data-testid="QuizModal"
      fullScreen
      open={open}
      onClose={handleClose}
      TransitionComponent={Transition}
      aria-labelledby="quiz-modal-title"
      sx={{
        '& .MuiDialog-paper': {
          backgroundColor: 'transparent'
        }
      }}
    >
      <div className="w-full h-[100vh] flex justify-center items-center px-1 sm:px-2 overflow-hidden bg-black/80 backdrop-blur-lg">
        <div className="w-full h-full -mt-6 flex justify-center items-center shadow-3 rounded-md overflow-hidden">
          <iframe
            src="https://your.nextstep.is/embed/jf-videos-quizz?expand=false"
            className="border-0 w-full h-full"
            title="Next Step of Faith Quiz"
          />
        </div>
        <IconButton
          edge="start"
          color="inherit"
          onClick={handleClose}
          aria-label="close quiz"
          tabIndex={0}
          sx={{
            mr: 2,
            position: 'absolute',
            top: 30,
            left: 40,
            color: 'white'
          }}
        >
          <CloseIcon />
        </IconButton>
      </div>
    </Dialog>
  )
}
