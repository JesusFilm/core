import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import last from 'lodash/last'
import { useRouter } from 'next/router'
import { ReactElement, useState } from 'react'

import { ThemeMode } from '@core/shared/ui/themes'

import { useVideoChildren } from '../../libs/useVideoChildren'
import { useVideo } from '../../libs/videoContext'
import { PageWrapper } from '../PageWrapper'
import { ShareDialog } from '../ShareDialog'
import { VideoGrid } from '../VideoGrid/VideoGrid'

import { ContainerDescription } from './ContainerDescription'
import { ContainerHero } from './ContainerHero'

// Usually Series or Collection Videos
export function VideoContainerPage(): ReactElement {
  const router = useRouter()
  const { snippet, slug, variant } = useVideo()
  const { loading, children } = useVideoChildren(variant?.slug, router.locale)
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
      hero={<ContainerHero openDialog={handleOpenDialog} />}
      headerThemeMode={ThemeMode.dark}
      hideHeaderSpacer
      showLanguageSwitcher
    >
      <Container maxWidth="xxl" data-testid="VideoContainerPage">
        <Stack
          spacing={{ xs: 4, md: 11 }}
          py={{ xs: 7, md: 17 }}
          direction="column"
        >
          <ContainerDescription
            value={last(snippet)?.value ?? ''}
            openDialog={handleOpenDialog}
          />
          <ShareDialog open={shareDialog} onClose={handleCloseDialog} />
          <Box>
            {loading ? (
              <VideoGrid variant="expanded" />
            ) : (
              <VideoGrid
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
