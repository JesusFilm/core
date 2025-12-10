import { Box, Container, Typography } from '@mui/material'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import { type KeyboardEvent, type ReactElement } from 'react'

export function BetaBanner(): ReactElement | null {
  const { t } = useTranslation('apps-resources')
  const router = useRouter()
  const isWatchRoute = router.pathname.startsWith('/watch')

  if (!isWatchRoute) return null

  const activateExperimentalMode = (): void => {
    document.cookie = 'EXPERIMENTAL=true; path=/'
    window.location.reload()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      activateExperimentalMode()
    }
  }

  return (
    <Box
      role="button"
      tabIndex={0}
      component="section"
      onClick={activateExperimentalMode}
      onKeyDown={handleKeyDown}
      aria-label={t('betaBanner.cta')}
      sx={{
        width: '100%',
        backgroundColor: 'primary.main',
        color: 'primary.contrastText',
        cursor: 'pointer'
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
        <Typography variant="body1">
          {t('betaBanner.message')}{' '}
          <Box component="span" sx={{ fontWeight: 700 }}>
            {t('betaBanner.cta')}
          </Box>
        </Typography>
      </Container>
    </Box>
  )
}
