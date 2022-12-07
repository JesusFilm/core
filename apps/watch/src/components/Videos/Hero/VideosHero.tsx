import { ReactElement } from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'

export function VideosHero(): ReactElement {
  return (
    <ThemeProvider
      themeMode={ThemeMode.dark}
      themeName={ThemeName.website}
      nested
    >
      <Box
        sx={{
          backgroundImage: `url(/images/videos-hero.png)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: 340,
          mb: 12
        }}
      >
        <Container
          maxWidth="xxl"
          style={{
            position: 'absolute',
            top: 194,
            margin: 0,
            textShadow: '0px 3px 4px rgba(0, 0, 0, 0.25)'
          }}
        >
          <Typography variant="h2" color="text.primary">
            Our full collection
          </Typography>
        </Container>
      </Box>
    </ThemeProvider>
  )
}
