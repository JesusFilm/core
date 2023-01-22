import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement, useMemo, useState } from 'react'
import { NextSeo } from 'next-seo'

import 'video.js/dist/video-js.css'

import { VideoLabel } from '../../../__generated__/globalTypes'
import { useVideo } from '../../libs/videoContext'
import { PageWrapper } from '../PageWrapper'
import { ShareDialog } from '../ShareDialog'
import { DownloadDialog } from '../DownloadDialog'
import { ShareButton } from '../ShareButton'
import { VideoCard } from '../VideoCard'
import { VideosCarousel, getRelatedVideos } from '../VideosCarousel'
import { DownloadButton } from './DownloadButton'
import { VideoHero } from './VideoHero'
import { VideoContent } from './VideoContent/VideoContent'
import { VideoContentCarousel } from './VideoContentCarousel'

// Usually FeatureFilm, ShortFilm, Episode or Segment Videos
export function VideoContentPage(): ReactElement {
  const {
    id,
    title,
    snippet,
    image,
    imageAlt,
    slug,
    variant,
    children,
    container,
    label
  } = useVideo()
  const [hasPlayed, setHasPlayed] = useState(false)
  const [openShare, setOpenShare] = useState(false)
  const [openDownload, setOpenDownload] = useState(false)

  const childVideos = useMemo(() => {
    if (container == null && label === VideoLabel.featureFilm) {
      return getRelatedVideos({ children })
    }
    return []
  }, [container, label, children])

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
      <PageWrapper
        hideHeader
        hero={
          <VideoHero onPlay={() => setHasPlayed(true)} hasPlayed={hasPlayed} />
        }
      >
        <>
          <VideoContentCarousel
            playing={hasPlayed}
            onShareClick={() => setOpenShare(true)}
            onDownloadClick={() => setOpenDownload(true)}
          />
          <Container maxWidth="xxl" sx={{ mb: 24 }}>
            <Stack
              direction="row"
              spacing="40px"
              sx={{
                mx: 0,
                mt: { xs: 5, md: 10 },
                mb: { xs: 5, md: 10 },
                maxWidth: '100%'
              }}
            >
              <VideoContent />
              <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <Stack
                  spacing={5}
                  mb={8}
                  direction={{ md: 'column', lg: 'row' }}
                >
                  <DownloadButton
                    variant="button"
                    onClick={() => setOpenDownload(true)}
                  />
                  <ShareButton
                    variant="button"
                    onClick={() => setOpenShare(true)}
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
          {/* TODO: Replace with proper related video components */}
          {childVideos.length !== 0 && (
            <Stack sx={{ mb: 14 }}>
              <Container maxWidth="xxl">
                <Typography variant="h4" gutterBottom sx={{ mb: 6 }}>
                  {title[0].value} Scenes
                </Typography>
              </Container>
              <VideosCarousel
                videos={childVideos}
                activeVideo={id}
                renderItem={(props: Parameters<typeof VideoCard>[0]) => {
                  return (
                    <VideoCard
                      {...props}
                      containerSlug={slug}
                      imageSx={{
                        ...props.imageSx,
                        border: '1px solid rgba(255, 255, 255, .12)',
                        borderRadius: '9px'
                      }}
                    />
                  )
                }}
              />
            </Stack>
          )}
        </>
      </PageWrapper>
    </>
  )
}
