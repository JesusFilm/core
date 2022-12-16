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

import { NextSeo } from 'next-seo'
import { useVideo } from '../../libs/videoContext'
import { VideoHero } from '../Hero'
import { PageWrapper } from '../PageWrapper'
import { VideosCarousel } from '../Videos/VideosCarousel/VideosCarousel'
import { ShareDialog } from '../ShareDialog'
import { VideoContent } from './VideoContent/VideoContent'

// Usually FeatureFilm, ShortFilm, Episode or Segment Videos
export function VideoContentPage(): ReactElement {
  const {
    title,
    snippet,
    image,
    imageAlt,
    container,
    children,
    slug,
    variant
  } = useVideo()
  const [openShare, setOpenShare] = useState(false)

  return (
    <>
      <NextSeo
        title={title[0].value}
        description={snippet[0].value ?? undefined}
        openGraph={{
          type: 'website',
          title: title[0].value,
          url: `${
            process.env.NEXT_PUBLIC_WATCH_URL ??
            'https://watch-jesusfilm.vercel.app'
          }/${slug}`,
          description: snippet[0].value ?? undefined,
          images:
            image != null
              ? [
                  {
                    url: image,
                    width: 1080,
                    height: 600,
                    alt: imageAlt[0].value,
                    type: 'image/jpeg'
                  }
                ]
              : []
        }}
        facebook={
          process.env.NEXT_PUBLIC_FACEBOOK_APP_ID != null
            ? { appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID }
            : undefined
        }
        twitter={{
          site: '@YourNextStepIs',
          cardType: 'summary_large_image'
        }}
      />
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
            <ShareDialog open={openShare} onClose={() => setOpenShare(false)} />
          </Container>
        </>
      </PageWrapper>
    </>
  )
}
