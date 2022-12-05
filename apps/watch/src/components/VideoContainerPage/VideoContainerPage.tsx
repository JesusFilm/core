import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement, useState } from 'react'
import Button from '@mui/material/Button'
import Share from '@mui/icons-material/Share'
import 'video.js/dist/video-js.css'

import { VideoContentFields } from '../../../__generated__/VideoContentFields'
import { SimpleHero } from '../Hero'
import { PageWrapper } from '../PageWrapper'
import { ShareDialog } from '../ShareDialog'
import { Description } from '../Description'

interface VideoContainerPageProps {
  content: VideoContentFields
}

// Usually Series or Collection Videos
export function VideoContainerPage({
  content
}: VideoContainerPageProps): ReactElement {
  const [openShare, setOpenShare] = useState(false)

  return (
    <PageWrapper hero={<SimpleHero video={content} />}>
      {content != null && (
        <Container maxWidth="xxl">
          <Description
            value={content.snippet[0]?.value}
            setOpenShare={() => setOpenShare(true)}
          />
          <ShareDialog
            open={openShare}
            video={content}
            routes={[]}
            onClose={() => setOpenShare(false)}
          />
          {/* Add grid here */}
        </Container>
      )}
    </PageWrapper>
  )
}
