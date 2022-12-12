import Container from '@mui/material/Container'
import Divider from '@mui/material/Divider'
import { useRouter } from 'next/router'
import { ReactElement, useState } from 'react'
import 'video.js/dist/video-js.css'

import { PageWrapper } from '../PageWrapper'
import { ShareDialog } from '../ShareDialog'
import { VideosGrid } from '../VideosGrid/VideosGrid'
import { useVideo } from '../../libs/videoContext'
import { ContainerDescription } from './ContainerDescription'
import { ContainerHero } from './ContainerHero'

// Usually Series or Collection Videos
export function VideoContainerPage(): ReactElement {
  const { snippet, children, slug } = useVideo()
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
    <PageWrapper hero={<ContainerHero openDialog={handleOpenDialog} />}>
      {snippet != null && (
        <Container maxWidth="xxl">
          <ContainerDescription
            value={snippet[0].value}
            openDialog={handleOpenDialog}
          />
          <ShareDialog
            open={shareDialog}
            routes={routeArray}
            onClose={handleCloseDialog}
          />
          <VideosGrid videos={children} routePrefix={slug} />
        </Container>
      )}
      <Divider />
    </PageWrapper>
  )
}
