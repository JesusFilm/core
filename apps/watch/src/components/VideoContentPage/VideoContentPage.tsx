import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import { ReactElement, useState } from 'react'
import Button from '@mui/material/Button'
import SaveAlt from '@mui/icons-material/SaveAlt'
import Share from '@mui/icons-material/Share'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'
import 'video.js/dist/video-js.css'

import { useVideo } from '../../libs/videoContext'
import { VideoHero } from '../Hero'
import { PageWrapper } from '../PageWrapper'
import { VideosCarousel } from '../Videos/VideosCarousel/VideosCarousel'
import { ShareDialog } from '../ShareDialog'
import { VideoContent } from './VideoContent/VideoContent'

// Usually FeatureFilm, ShortFilm, Episode or Segment Videos
export function VideoContentPage(): ReactElement {
  const { container, children, slug, variant } = useVideo()
  const [openShare, setOpenShare] = useState(false)

  return (
    <PageWrapper hero={<VideoHero />}>
      <>
        <ThemeProvider
          themeName={ThemeName.website}
          themeMode={ThemeMode.dark}
          nested
        >
          <Paper elevation={0} square sx={{ pt: '20px' }}>
            <Container maxWidth="xxl">
              {/* TODO: combine content and container children? */}
              {children.length > 0 && (
                <VideosCarousel
                  videos={children}
                  routePrefix={slug}
                  routeSuffix={variant?.slug.split('/')[1]}
                />
              )}
              {container != null && container.children.length > 0 && (
                <VideosCarousel
                  videos={container.children}
                  routePrefix={container.slug}
                  routeSuffix={container.variant?.slug.split('/')[1]}
                />
              )}
            </Container>
          </Paper>
        </ThemeProvider>
        <Container maxWidth="xxl">
          <Stack
            direction="row"
            spacing="100px"
            sx={{
              mx: 0,
              mt: { xs: 5, md: 10 },
              mb: { xs: 5, md: 10 },
              maxWidth: '100%'
            }}
          >
            <VideoContent />
            <Box width="336px" sx={{ display: { xs: 'none', md: 'block' } }}>
              <Stack direction="row" spacing="20px" mb="40px">
                <Button variant="outlined">
                  <SaveAlt />
                  &nbsp; Download
                </Button>
                <Button variant="outlined" onClick={() => setOpenShare(true)}>
                  <Share />
                  &nbsp; Share
                </Button>
              </Stack>
            </Box>
          </Stack>
          <ShareDialog
            open={openShare}
            routes={[]}
            onClose={() => setOpenShare(false)}
          />
        </Container>
      </>
    </PageWrapper>
  )
}
