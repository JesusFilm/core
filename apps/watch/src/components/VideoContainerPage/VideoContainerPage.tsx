import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import { ReactElement, useState } from 'react'

import { useVideoChildren } from '../../libs/useVideoChildren'
import { useVideo } from '../../libs/videoContext'
import { PageWrapper } from '../PageWrapper'
import { ShareDialog } from '../ShareDialog'
import { VideoGrid } from '../VideoGrid/VideoGrid'

import { ContainerDescription } from './ContainerDescription'
import { ContainerHero } from './ContainerHero'

interface VideoContainerPageProps {
  languageId: string
}

// Usually Series or Collection Videos
export function VideoContainerPage({
  languageId
}: VideoContainerPageProps): ReactElement {
  const { snippet, slug, variant } = useVideo()
  const { loading, children } = useVideoChildren(variant?.slug)
  const [shareDialog, setShareDialog] = useState<boolean>(false)
  const realChildren = children.filter((video) => video.variant !== null)
  function handleOpenDialog(): void {
    setShareDialog(true)
  }

  function handleCloseDialog(): void {
    setShareDialog(false)
  }

  return (
    <PageWrapper
      languageId={languageId}
      hero={<ContainerHero openDialog={handleOpenDialog} />}
    >
      <Container maxWidth="xxl" data-testid="VideoContainerPage">
        <Stack
          spacing={{ xs: 4, md: 11 }}
          py={{ xs: 7, md: 17 }}
          direction="column"
        >
          <ContainerDescription
            value={snippet[0].value}
            openDialog={handleOpenDialog}
            languageId={languageId}
          />
          <ShareDialog
            languageId={languageId}
            open={shareDialog}
            onClose={handleCloseDialog}
          />
          <Box>
            {loading ? (
              <VideoGrid loading languageId={languageId} variant="expanded" />
            ) : (
              <VideoGrid
                languageId={languageId}
                containerSlug={slug}
                videos={realChildren}
                variant="expanded"
              />
            )}
          </Box>
        </Stack>
      </Container>
    </PageWrapper>
  )
}
