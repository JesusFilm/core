import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Image from 'next/legacy/image'
import { ReactElement } from 'react'

import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'

import background from './assets/background.png'

export function VideosHero(): ReactElement {
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
      >
        <Image
          src={background}
          layout="fill"
          objectFit="cover"
          alt="hero background"
        />
        <Container maxWidth="xxl" sx={{ pb: { xs: 10, md: 15 }, zIndex: 1 }}>
          <Typography
            variant="h2"
            color="text.primary"
            sx={{ textShadow: '0px 3px 4px rgba(0, 0, 0, 0.25)' }}
          >
            Jesus Film Collection
          </Typography>
        </Container>
      </Box>
    </ThemeProvider>
  )
}
