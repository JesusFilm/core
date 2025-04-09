import CloseIcon from '@mui/icons-material/Close'
import CircularProgress from '@mui/material/CircularProgress'
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
          <div className="absolute inset-0 flex -z-1 items-center justify-center">
            <div className="scale-200">
              <CircularProgress color="secondary" />
            </div>
          </div>
          <iframe
            data-testid="QuizIframe"
            src="https://your.nextstep.is/embed/easter2025?expand=false"
            className="border-0 w-full h-full z-1"
            title="Next Step of Faith Quiz"
          />
        </div>
        <IconButton
          data-testid="CloseQuizButton"
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
            color: 'white',
            zIndex: 10
          }}
        >
          <CloseIcon />
        </IconButton>
      </div>
    </Dialog>
  )
}
