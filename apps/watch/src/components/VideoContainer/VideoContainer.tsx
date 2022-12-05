import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'

import { ReactElement, useState } from 'react'

import Button from '@mui/material/Button'
import SaveAlt from '@mui/icons-material/SaveAlt'
import Share from '@mui/icons-material/Share'

import 'video.js/dist/video-js.css'

import { VideoContentFields } from '../../../__generated__/VideoContentFields'
import { LanguageProvider } from '../../libs/languageContext/LanguageContext'
import { SimpleHero, VideoHero } from '../Hero'
import { PageWrapper } from '../PageWrapper'
import { VideosCarousel } from '../Videos/VideosCarousel/VideosCarousel'
import { ShareDialog } from '../ShareDialog'
import { VideoContent } from '../Video/VideoContent/VideoContent'

interface VideoContainerProps {
  container?: VideoContentFields
  content: VideoContentFields
}

export function VideoContainer({
  container,
  content
}: VideoContainerProps): ReactElement {
  const [openShare, setOpenShare] = useState(false)

  return (
    <LanguageProvider>
      <PageWrapper
        hero={
          content == null ? (
            <></>
          ) : content.variant?.hls != null ? (
            <VideoHero video={content} />
          ) : (
            <SimpleHero video={content} />
          )
        }
      >
        {content != null && (
          <>
            <Box sx={{ pt: '20px' }}>
              {content.children.length > 0 && (
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
            </Box>
            <Stack
              direction="row"
              spacing="100px"
              sx={{
                mx: 0,
                mt: 20,
                mb: 80,
                maxWidth: '100%'
              }}
            >
              <VideoContent video={content} />
              <Box width="336px">
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
              video={content}
              routes={[]}
              onClose={() => setOpenShare(false)}
            />
          </>
        )}
      </PageWrapper>
    </LanguageProvider>
  )
}
