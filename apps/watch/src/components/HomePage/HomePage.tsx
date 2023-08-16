import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'

import { VideoChildFields } from '../../../__generated__/VideoChildFields'
import { PageWrapper } from '../PageWrapper'
import { VideoGrid } from '../VideoGrid'

import { HomeHero } from './HomeHero'
import { SeeAllVideos } from './SeeAllVideos'

interface HomePageProps {
  videos: VideoChildFields[]
}

export function HomePage({ videos }: HomePageProps): ReactElement {
  return (
    <PageWrapper hero={<HomeHero />}>
      <ThemeProvider
        themeName={ThemeName.website}
        themeMode={ThemeMode.dark}
        nested
      >
        <Box sx={{ backgroundColor: 'background.default' }}>
          <Container maxWidth="xxl" sx={{ paddingY: '4rem' }}>
            <VideoGrid videos={videos} variant="contained" />
            <SeeAllVideos />
            <Box
              sx={{
                display: 'flex',
                width: '100%',
                alignItems: 'center',
                position: 'relative',
                py: { xs: 10, lg: 20 }
              }}
            >
              <Stack spacing={10}>
                <Typography variant="h3" component="h2" color="text.primary">
                  About Our Project
                </Typography>
                <Stack direction="row" spacing={4}>
                  <Box
                    sx={{
                      backgroundColor: 'primary.main',
                      height: 'inherit',
                      width: { xs: 38, lg: 14 }
                    }}
                  />
                  <Typography
                    variant="subtitle2"
                    component="h3"
                    sx={{ opacity: 0.85 }}
                    color="text.primary"
                  >
                    With 70% of the world not being able to speak English, there
                    is a huge opportunity for the gospel to spread to unreached
                    places. We have a vision to make it easier to watch,
                    download and share Christian videos with people in their
                    native heart language.
                  </Typography>
                </Stack>
                <Typography
                  variant="subtitle1"
                  component="h3"
                  sx={{ opacity: 0.8 }}
                  color="text.primary"
                >
                  Jesus Film Project is a Christian ministry with a vision to
                  reach the world with the gospel of Jesus Christ through
                  evangelistic videos. Watch from over 2000 languages on any
                  device and share it with others.
                </Typography>
              </Stack>
            </Box>
          </Container>
        </Box>
      </ThemeProvider>
    </PageWrapper>
  )
}
