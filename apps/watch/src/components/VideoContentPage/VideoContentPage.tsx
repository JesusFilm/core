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
import { VideoContentFields } from '../../../__generated__/VideoContentFields'
import { LanguageProvider } from '../../libs/languageContext/LanguageContext'
import { VideoHero } from '../Hero'
import { PageWrapper } from '../PageWrapper'
import { VideosCarousel } from '../Videos/VideosCarousel/VideosCarousel'
import { ShareDialog } from '../ShareDialog'
import { VideoContent } from '../Video/VideoContent/VideoContent'

interface VideoContentPageProps {
  container?: VideoContentFields
  content: VideoContentFields
}

// Usually FeatureFilm, ShortFilm, Episode or Segment Videos
export function VideoContentPage({
  container,
  content
}: VideoContentPageProps): ReactElement {
  const [openShare, setOpenShare] = useState(false)

  return (
    <LanguageProvider>
      <PageWrapper hero={<VideoHero video={content} />}>
        {content != null && (
          <>
            <ThemeProvider
              themeName={ThemeName.website}
              themeMode={ThemeMode.dark}
              nested
            >
              <Paper elevation={0} square sx={{ pt: '20px' }}>
                <Container maxWidth="xxl">
                  {/* TODO: combine content and container children? */}
                  {content?.children.length > 0 && (
                    <VideosCarousel
                      videos={content.children}
                      routePrefix={content.slug}
                      routeSuffix={content.variant?.slug.split('/')[1]}
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
                  mt: 20,
                  mb: 20,
                  maxWidth: '100%'
                }}
              >
                <VideoContent video={content} />
                <Box
                  width="336px"
                  sx={{ display: { xs: 'none', md: 'block' } }}
                >
                  <Stack direction="row" spacing="20px" mb="40px">
                    <Button variant="outlined">
                      <SaveAlt />
                      &nbsp; Download
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => setOpenShare(true)}
                    >
                      <Share />
                      &nbsp; Share
                    </Button>
                  </Stack>
                </Box>
              </Stack>
              <ShareDialog
                open={openShare}
                video={content}
                routes={[]}
                onClose={() => setOpenShare(false)}
              />
            </Container>
          </>
        )}
      </PageWrapper>
    </LanguageProvider>
  )
}
