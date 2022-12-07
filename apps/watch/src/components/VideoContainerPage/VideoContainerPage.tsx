import Container from '@mui/material/Container'
import { useRouter } from 'next/router'
import { ReactElement, useState } from 'react'
import 'video.js/dist/video-js.css'

import { VideoContentFields } from '../../../__generated__/VideoContentFields'
import { PageWrapper } from '../PageWrapper'
import { ShareDialog } from '../ShareDialog'
import { VideosGrid } from '../Videos/VideosGrid/VideosGrid'
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
  const [openShare, setOpenShare] = useState(false)
  const routeArray: string[] = []

  if (router != null) {
    Object.values(router?.query).forEach((value) => {
      if (typeof value === 'string') {
        routeArray.push(value)
      }
    })
  }

  return (
    <PageWrapper hero={<ContainerHero video={content} />}>
      {content != null && (
        <Container maxWidth="xxl">
          <ContainerDescription
            value={content.snippet[0].value}
            setOpenShare={() => setOpenShare(true)}
          />
          <ShareDialog
            open={openShare}
            routes={routeArray}
            onClose={() => setOpenShare(false)}
          />
          <VideosGrid
            videos={content.children}
            routePrefix={content.slug}
            routeSuffix={content.variant?.slug.split('/')[1]}
          />
        </Container>
      )}
    </PageWrapper>
  )
}
