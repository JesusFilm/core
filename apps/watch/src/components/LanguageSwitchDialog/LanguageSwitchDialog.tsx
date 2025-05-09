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
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ReactElement, Ref, forwardRef, useEffect, useState } from 'react'

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: ReactElement
  },
  ref: Ref<unknown>
) {
  return <Slide direction="left" ref={ref} {...props} />
})

interface Language {
  languageCode: string
  localName: string
  nativeName?: string
}

interface LanguageSwitchDialogProps {
  open: boolean
  handleClose: () => void
}

export function LanguageSwitchDialog({
  open,
  handleClose
}: LanguageSwitchDialogProps): ReactElement {
  const { t, i18n } = useTranslation('apps-watch')
  const router = useRouter()

  const [languages, setLanguages] = useState<Language[]>([])
  const [currentLanguageCode, setCurrentLanguageCode] = useState(
    i18n?.language ?? 'en'
  )

  function handleChange(languageCode: string): void {
    setCurrentLanguageCode(languageCode)

    const cookieFingerprint = '00005'
    document.cookie = `NEXT_LOCALE=${cookieFingerprint}---${languageCode}; path=/`
    const path = router.asPath
    void router.push(path, path, { locale: languageCode })
    handleClose()
  }

  useEffect(() => {
    const supportedLanguageCodes = (
      i18n.options as unknown as { locales: string[] }
    )?.locales

    if (supportedLanguageCodes == null) return
    const formattedLanguages = supportedLanguageCodes
      .filter((languageCode) => languageCode !== 'zh')
      .map((languageCode): Language => {
        const nativeName = new Intl.DisplayNames([currentLanguageCode], {
          type: 'language'
        }).of(languageCode)
        const localName = new Intl.DisplayNames([languageCode], {
          type: 'language'
        }).of(languageCode)

        return {
          languageCode,
          nativeName: nativeName === localName ? undefined : nativeName,
          localName: localName ?? ''
        }
      })
    setLanguages(formattedLanguages)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLanguageCode])

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
                key={language.languageCode}
                onClick={() => handleChange(language.languageCode)}
                {...commonButtonStyles}
                sx={{
                  ...commonButtonStyles,
                  textTransform: 'uppercase',
                  bgcolor: 'rgba(41, 37, 36, 0.5)'
                }}
                data-testid={`language-button-${language.languageCode}`}
              >
                {language.localName}
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
