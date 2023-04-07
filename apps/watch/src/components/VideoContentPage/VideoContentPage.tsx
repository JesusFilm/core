import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import { ReactElement, useState } from 'react'
import { NextSeo } from 'next-seo'
import { useVideo } from '../../libs/videoContext'
import { PageWrapper } from '../PageWrapper'
import { ShareDialog } from '../ShareDialog'
import { DownloadDialog } from '../DownloadDialog'
import { ShareButton } from '../ShareButton'
import { useVideoChildren } from '../../libs/useVideoChildren'
import { VideoCarousel } from '../VideoCarousel'
import { getSlug } from '../VideoCard'
import { VideoContent } from './VideoContent/VideoContent'
import { DownloadButton } from './DownloadButton'
import { VideoHero } from './VideoHero'

import 'video.js/dist/video-js.css'
import { VideoHeading } from './VideoHeading'

// Usually FeatureFilm, ShortFilm, Episode or Segment Videos
export function VideoContentPage(): ReactElement {
  const {
    title,
    snippet,
    image,
    imageAlt,
    slug,
    variant,
    id,
    label,
    container,
    childrenCount
  } = useVideo()
  const { loading, children } = useVideoChildren(
    container?.variant?.slug ?? variant?.slug
  )
  const [hasPlayed, setHasPlayed] = useState(false)
  const [openShare, setOpenShare] = useState(false)
  const [openDownload, setOpenDownload] = useState(false)

  const ogSlug = getSlug(container?.slug, label, variant?.slug)

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
          }${ogSlug}`,
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
          <>
            <VideoHero
              onPlay={() => setHasPlayed(true)}
              hasPlayed={hasPlayed}
            />
            <Stack
              sx={{
                backgroundColor: 'background.default',
                py:
                  hasPlayed ||
                  (container?.childrenCount ?? 0) > 0 ||
                  childrenCount > 0
                    ? 5
                    : 0
              }}
              spacing={5}
            >
              <VideoHeading
                loading={loading}
                hasPlayed={hasPlayed}
                videos={children}
                onShareClick={() => setOpenShare(true)}
                onDownloadClick={() => setOpenDownload(true)}
              />
              {((container?.childrenCount ?? 0) > 0 || childrenCount > 0) && (
                <Box pb={4}>
                  <VideoCarousel
                    loading={loading}
                    videos={children}
                    containerSlug={container?.slug ?? slug}
                    activeVideoId={id}
                  />
                </Box>
              )}
            </Stack>
          </>
        }
      >
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
              <Stack spacing={5} mb={8} direction={{ md: 'column', lg: 'row' }}>
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
      </PageWrapper>
    </>
  )
}
