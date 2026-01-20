import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { type KeyboardEvent, type ReactElement } from 'react'

export function BetaBanner(): ReactElement | null {
  const { t } = useTranslation('apps-resources')
  const router = useRouter()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const isWatchRoute = router?.pathname?.startsWith('/watch') ?? false

  const hasExperimentalCookie =
    typeof document !== 'undefined' &&
    document.cookie.includes('EXPERIMENTAL=true')

  if (
    !isWatchRoute ||
    router == null ||
    !router.isReady ||
    hasExperimentalCookie
  )
    return null

  const activateExperimentalMode = (): void => {
    const isHttps = window.location.protocol === 'https:'
    document.cookie = `EXPERIMENTAL=true; max-age=2592000; path=/; SameSite=Lax${isHttps ? '; Secure' : ''}`
    window.location.reload()
  }

  const handleActivateExperimentalMode = (): void => {
    activateExperimentalMode()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      activateExperimentalMode()
    }
  }

  return (
    <Box
      role="banner"
      component="section"
      sx={{
        width: '100%',
        backgroundColor: 'primary.main',
        color: 'primary.contrastText',
        position: 'relative',
        overflow: 'hidden',
        transition: 'background-color 0.3s ease',
        '&:hover': {
          backgroundColor: '#e53e3e',
          filter: 'saturate(1.1)'
        }
      }}
    >
      <Container
        sx={{
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center'
        }}
      >
        <Box
          component="button"
          tabIndex={0}
          onClick={handleActivateExperimentalMode}
          onKeyDown={handleKeyDown}
          aria-label={t('Try the new design.')}
          sx={{
            background: 'none',
            border: 'none',
            padding: 0,
            font: 'inherit',
            color: 'inherit',
            cursor: 'pointer',
            width: '100%',
            textAlign: 'center',
            '&:focus': {
              outline: '2px solid white',
              outlineOffset: '2px'
            }
          }}
        >
          <Typography variant="h6">
            ✨{' '}
            {isMobile
              ? t('Better search, languages, and collections.')
              : t(
                  'Better search. Better language support. Better collections.'
                )}{' '}
            <Box
              component="span"
              sx={{ display: 'inline-block', pr: 4, pl: 2 }}
            >
              →
            </Box>
            <Box
              component="span"
              sx={{
                fontWeight: 700,
                textDecoration: 'underline',
                textUnderlineOffset: '3px',
                textDecorationColor: 'rgba(255, 255, 255, 0.7)'
              }}
            >
              {isMobile ? t('New Design') : t('Try the new design.')}
            </Box>
          </Typography>
        </Box>
      </Container>
    </Box>
  )
}
