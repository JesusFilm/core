import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'

import background from './assets/background.png'

export function VideosHero(): ReactElement {
  const { t } = useTranslation('apps-watch')
  return (
    <ThemeProvider
      themeMode={ThemeMode.dark}
      themeName={ThemeName.website}
      nested
    >
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'flex-end',
          height: { xs: 240, md: 340 },
          backgroundColor: '#771E3E'
        }}
        data-testid="VideosHero"
      >
        <Image
          src={background}
          alt="hero background"
          fill
          sizes="100vw"
          style={{
            objectFit: 'cover'
          }}
        />
        <Container maxWidth="xxl" sx={{ pb: { xs: 10, md: 15 }, zIndex: 1 }}>
          <Typography
            variant="h2"
            color="text.primary"
            sx={{ textShadow: '0px 3px 4px rgba(0, 0, 0, 0.25)' }}
          >
            {t('Jesus Film Collection')}
          </Typography>
        </Container>
      </Box>
    </ThemeProvider>
  )
}
