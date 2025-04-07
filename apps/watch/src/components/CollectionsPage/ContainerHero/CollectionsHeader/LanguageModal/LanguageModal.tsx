import CloseIcon from '@mui/icons-material/Close'
import EmailIcon from '@mui/icons-material/Email'
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

interface LanguageModalProps {
  open: boolean
  onClose: () => void
  feedbackButtonLabel: string
}

const languages = [
  { code: 'en', name: 'English', urlName: 'english' },
  { code: 'fr', name: 'Français', urlName: 'french' },
  { code: 'es', name: 'Español', urlName: 'spanish-latin-american' },
  { code: 'pt', name: 'Português', urlName: 'portuguese-brazil' },
  { code: 'ru', name: 'Русский', urlName: 'russian' }
]

export function LanguageModal({
  open,
  onClose,
  feedbackButtonLabel
}: LanguageModalProps): ReactElement {
  const handleClose = (): void => {
    onClose()
  }

  return (
    <Dialog
      data-testid="LanguageModal"
      fullScreen
      open={open}
      onClose={handleClose}
      TransitionComponent={Transition}
      aria-labelledby="language-modal-title"
      sx={{
        '& .MuiDialog-paper': {
          backgroundColor: 'transparent'
        }
      }}
    >
      <div className="w-full h-[100vh] flex justify-center items-center px-1 sm:px-2 overflow-hidden bg-black/80 backdrop-blur-lg">
        <div className="w-full max-w-md rounded-lg p-6">
          <div className="grid grid-cols-1 gap-4 font-sans">
            {languages.map((language) => (
              <a
                href={`/watch/easter/${language.urlName}`}
                key={language.code}
                className="inline-block text-center gap-2 px-4 py-4 text-md text-white font-semibold uppercase tracking-wider rounded-lg bg-stone-800/50 hover:bg-red-500 hover:text-white transition-colors duration-200 cursor-pointer"
                data-testid={`language-button-${language.code}`}
              >
                {language.name}
              </a>
            ))}

            <a
              href={`/contact`}
              className="mt-6 inline-block text-center gap-2 px-4 py-4 text-md text-white font-semibold tracking-wider rounded-lg bg-stone-800/10 hover:bg-red-500 hover:text-white transition-colors duration-200 cursor-pointer"
              data-testid={`language-button-support`}
            >
              <EmailIcon sx={{ fontSize: 20, marginRight: 2 }} />{' '}
              {feedbackButtonLabel}
            </a>
          </div>
        </div>
        <IconButton
          data-testid="CloseLanguageButton"
          edge="start"
          color="inherit"
          onClick={handleClose}
          aria-label="close language selector"
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
