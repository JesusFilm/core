import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import { ReactElement, useState } from 'react'
import Button from '@mui/material/Button'
import SaveAlt from '@mui/icons-material/SaveAlt'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'
import { NextSeo } from 'next-seo'
import { useVideo } from '../../libs/videoContext'
import { PageWrapper } from '../PageWrapper'
import { ShareDialog } from '../ShareDialog'
import { VideosCarousel } from '../VideosCarousel/VideosCarousel'
import { CarouselItem } from '../Video/CarouselItem/CarouselItem'
import { DownloadDialog } from '../DownloadDialog'
import { ShareButton } from '../VideoContainerPage/ShareButton'
import { VideoHero } from './VideoHero'
import { VideoContent } from './VideoContent/VideoContent'

// Usually FeatureFilm, ShortFilm, Episode or Segment Videos
export function VideoContentPage(): ReactElement {
  const { title, snippet, image, imageAlt, children, slug, variant } =
    useVideo()
  const [openShare, setOpenShare] = useState(false)
  const [openDownload, setOpenDownload] = useState(false)

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
              {/* TODO: combine content and container children? */}
              {children.length > 0 && (
                <VideosCarousel
                  videos={children}
                  renderItem={(props: Parameters<typeof CarouselItem>[0]) => {
                    return <CarouselItem {...props} />
                  }}
                />
              )}
              {/* {container != null && container.children.length > 0 && (
                <VideosCarousel
                  videos={container.children}
                  renderItem={(props: Parameters<typeof CarouselItem>[0]) => {
                    return <CarouselItem {...props} />
                }}
                />
              )}   */}
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
                  <Button
                    variant="outlined"
                    onClick={() => setOpenDownload(true)}
                  >
                    <SaveAlt />
                    Download
                  </Button>
                  <ShareButton
                    variant="button"
                    openDialog={() => setOpenShare(true)}
                  />
                </Stack>
              </Box>
            </Stack>
            {variant != null && variant.downloads.length > 0 && (
              <DownloadDialog
                open={openDownload}
                onClose={() => {
                  setOpenDownload(false)
                }}
              />
            )}
            <ShareDialog open={openShare} onClose={() => setOpenShare(false)} />
          </Container>
        </>
      </PageWrapper>
    </>
  )
}
