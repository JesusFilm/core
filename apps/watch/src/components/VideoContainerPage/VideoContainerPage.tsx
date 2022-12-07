import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement, useState } from 'react'
import Button from '@mui/material/Button'
import Share from '@mui/icons-material/Share'
import 'video.js/dist/video-js.css'

import { VideoContentFields } from '../../../__generated__/VideoContentFields'
import { PageWrapper } from '../PageWrapper'
import { ShareDialog } from '../ShareDialog'
import { ContainerHero } from './ContainerHero'

interface VideoContainerPageProps {
  content: VideoContentFields
}

// Usually Series or Collection Videos
export function VideoContainerPage({
  content
}: VideoContainerPageProps): ReactElement {
  const [openShare, setOpenShare] = useState(false)

  return (
    <PageWrapper hero={<ContainerHero video={content} />}>
      {content != null && (
        <Container maxWidth="xxl">
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
            <Typography variant="body1">{content.snippet[0]?.value}</Typography>
            <Box width="336px">
              <Stack direction="row" spacing="20px" mb="40px">
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
          {/* Add grid here */}
        </Container>
      )}
    </PageWrapper>
  )
}
