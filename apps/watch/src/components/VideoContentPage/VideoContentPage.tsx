import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import { ReactElement, useState } from 'react'
import Button from '@mui/material/Button'
import SaveAlt from '@mui/icons-material/SaveAlt'
import { NextSeo } from 'next-seo'

import 'video.js/dist/video-js.css'

import { useVideo } from '../../libs/videoContext'
import { PageWrapper } from '../PageWrapper'
import { ShareDialog } from '../ShareDialog'
import { DownloadDialog } from '../DownloadDialog'
import { ShareButton } from '../VideoContainerPage/ShareButton'
import { VideoHero } from './VideoHero'
import { VideoContent } from './VideoContent/VideoContent'
import { VideoContentCarousel } from './VideoContentCarousel'

// Usually FeatureFilm, ShortFilm, Episode or Segment Videos
export function VideoContentPage(): ReactElement {
  const {
    title,
    snippet,
    image,
    imageAlt,
    children,
    slug,
    variant,
    container
  } = useVideo()
  const [hasPlayed, setHasPlayed] = useState(false)
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
      <PageWrapper hero={<VideoHero onPlay={() => setHasPlayed(true)} />}>
        <>
          {children.length > 0 ||
            (container != null && container.children.length > 0 && (
              <VideoContentCarousel playing={hasPlayed} />
            ))}
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
