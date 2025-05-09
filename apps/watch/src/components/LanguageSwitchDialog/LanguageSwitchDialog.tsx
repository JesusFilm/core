import CloseIcon from '@mui/icons-material/Close'
import EmailIcon from '@mui/icons-material/Email'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Dialog from '@mui/material/Dialog'
import IconButton from '@mui/material/IconButton'
import Slide from '@mui/material/Slide'
import Stack from '@mui/material/Stack'
import { TransitionProps } from '@mui/material/transitions'
import { useTranslation } from 'next-i18next'
import { ReactElement, Ref, forwardRef } from 'react'

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: ReactElement
  },
  ref: Ref<unknown>
) {
  return <Slide direction="left" ref={ref} {...props} />
})

interface LanguageSwitchDialogProps {
  open: boolean
  handleClose: () => void
}

export function LanguageSwitchDialog({
  open,
  handleClose
}: LanguageSwitchDialogProps): ReactElement {
  const { t } = useTranslation('apps-watch')

  const languages = [
    { code: 'en', name: 'English', urlName: 'english' },
    { code: 'fr', name: 'Français', urlName: 'french' },
    { code: 'es', name: 'Español', urlName: 'spanish-latin-american' },
    { code: 'pt', name: 'Português', urlName: 'portuguese-brazil' },
    { code: 'ru', name: 'Русский', urlName: 'russian' }
  ]

  const commonButtonStyles = {
    py: 3,
    fullWidth: true,
    variant: 'contained' as const,
    '&:hover': {
      bgcolor: 'error.main'
    }
  }

  return (
    <Dialog
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
      <Box
        sx={{
          width: '100%',
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          px: { xs: 1, sm: 2 },
          overflow: 'hidden',
          bgcolor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)'
        }}
      >
        <Container
          maxWidth="sm"
          sx={{
            p: 3,
            width: '100%',
            maxWidth: '28rem'
          }}
        >
          <Stack spacing={2}>
            {languages.map((language) => (
              <Button
                key={language.code}
                href={`/watch/easter/${language.urlName}`}
                {...commonButtonStyles}
                sx={{
                  ...commonButtonStyles,
                  textTransform: 'uppercase',
                  bgcolor: 'rgba(41, 37, 36, 0.5)'
                }}
                data-testid={`language-button-${language.code}`}
              >
                {language.name}
              </Button>
            ))}

            <Button
              href="/contact"
              startIcon={<EmailIcon />}
              {...commonButtonStyles}
              sx={{
                ...commonButtonStyles,
                mt: 3,
                bgcolor: 'rgba(41, 37, 36, 0.1)'
              }}
              data-testid="language-button-support"
            >
              {t('Contact Us')}
            </Button>
          </Stack>
        </Container>
        <IconButton
          data-testid="CloseLanguageButton"
          edge="start"
          color="inherit"
          onClick={handleClose}
          aria-label="close language selector"
          tabIndex={0}
          sx={{
            position: 'absolute',
            top: 30,
            left: 40,
            color: 'white',
            zIndex: 10
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>
    </Dialog>
  )
}
