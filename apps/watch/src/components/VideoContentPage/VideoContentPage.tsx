import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import { ReactElement, useState } from 'react'
import Button from '@mui/material/Button'
import SaveAlt from '@mui/icons-material/SaveAlt'
import Share from '@mui/icons-material/Share'

import 'video.js/dist/video-js.css'

import { useVideo } from '../../libs/videoContext'
import { PageWrapper } from '../PageWrapper'
import { ShareDialog } from '../ShareDialog'
import { DownloadDialog } from '../DownloadDialog'
import { VideoHero } from './VideoHero'
import { VideoContent } from './VideoContent/VideoContent'
import { VideoContentCarousel } from './VideoContentCarousel'

// Usually FeatureFilm, ShortFilm, Episode or Segment Videos
export function VideoContentPage(): ReactElement {
  const { variant, children, container } = useVideo()
  const [openShare, setOpenShare] = useState(false)
  const [openDownload, setOpenDownload] = useState(false)

  console.log(container)

  return (
    <PageWrapper hero={<VideoHero />}>
      <>
        {children.length > 0 ||
          (container != null && container.children.length > 0 && (
            <VideoContentCarousel />
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
                <Button variant="outlined" onClick={() => setOpenShare(true)}>
                  <Share />
                  Share
                </Button>
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
