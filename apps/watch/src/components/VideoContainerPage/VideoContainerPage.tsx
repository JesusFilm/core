import Container from '@mui/material/Container'
import { useRouter } from 'next/router'
import { ReactElement, useState } from 'react'
import 'video.js/dist/video-js.css'

import { VideoContentFields } from '../../../__generated__/VideoContentFields'
import { PageWrapper } from '../PageWrapper'
import { ShareDialog } from '../ShareDialog'
import { ContainerDescription } from './ContainerDescription'
import { ContainerHero } from './ContainerHero'

interface VideoContainerPageProps {
  content: VideoContentFields
}

// Usually Series or Collection Videos
export function VideoContainerPage({
  content
}: VideoContainerPageProps): ReactElement {
  const router = useRouter()
  const [shareDialog, setShareDialog] = useState<boolean>(false)
  const routeArray: string[] = []

  function handleOpenDialog(): void {
    setShareDialog(true)
  }

  function handleCloseDialog(): void {
    setShareDialog(false)
  }

  if (router != null) {
    Object.values(router?.query).forEach((value) => {
      if (typeof value === 'string') {
        routeArray.push(value)
      }
    })
  }

  return (
    <PageWrapper
      hero={<ContainerHero video={content} openDialog={handleOpenDialog} />}
    >
      {content != null && (
        <Container maxWidth="xxl">
          <ContainerDescription
            value={content.snippet[0].value}
            openDialog={handleOpenDialog}
          />
          <ShareDialog
            open={shareDialog}
            routes={routeArray}
            onClose={handleCloseDialog}
          />
          {/* Add grid here */}
        </Container>
      )}
    </PageWrapper>
  )
}
