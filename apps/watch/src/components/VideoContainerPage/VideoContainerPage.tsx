import Container from '@mui/material/Container'
import { useRouter } from 'next/router'
import { ReactElement, useState } from 'react'
import 'video.js/dist/video-js.css'

import { VideoContentFields } from '../../../__generated__/VideoContentFields'
import { SimpleHero } from '../Hero'
import { PageWrapper } from '../PageWrapper'
import { ShareDialog } from '../ShareDialog'
import { ContainerDescription } from './ContainerDescription'

interface VideoContainerPageProps {
  content: VideoContentFields
}

// Usually Series or Collection Videos
export function VideoContainerPage({
  content
}: VideoContainerPageProps): ReactElement {
  const router = useRouter()
  const [openShare, setOpenShare] = useState(false)
  const newArray: string[] = []

  if (router != null) {
    Object.values(router?.query).forEach((value) => {
      if (typeof value === 'string') {
        newArray.push(value)
      }
    })
  }

  return (
    <PageWrapper hero={<SimpleHero video={content} />}>
      {content != null && (
        <Container maxWidth="xxl">
          <ContainerDescription
            value={content.snippet[0].value}
            setOpenShare={() => setOpenShare(true)}
          />
          <ShareDialog
            open={openShare}
            video={content}
            routes={newArray}
            onClose={() => setOpenShare(false)}
          />
          {/* Add grid here */}
        </Container>
      )}
    </PageWrapper>
  )
}
