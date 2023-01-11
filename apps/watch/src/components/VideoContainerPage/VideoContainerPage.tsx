import Container from '@mui/material/Container'
import { useRouter } from 'next/router'
import { ReactElement, useState } from 'react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { gql, useQuery } from '@apollo/client'
import { GetVideoChildren } from '../../../__generated__/GetVideoChildren'
import { PageWrapper } from '../PageWrapper'
import { ShareDialog } from '../ShareDialog'
import { VideoGrid } from '../VideoGrid/VideoGrid'
import { useVideo } from '../../libs/videoContext'
import { VIDEO_CHILD_FIELDS } from '../../libs/videoChildFields'
import { ContainerDescription } from './ContainerDescription'
import { ContainerHero } from './ContainerHero'

export const GET_VIDEO_CHILDREN = gql`
  ${VIDEO_CHILD_FIELDS}
  query GetVideoChildren($id: ID!, $languageId: ID) {
    video(id: $id) {
      children {
        ...VideoChildFields
      }
    }
  }
`

// Usually Series or Collection Videos
export function VideoContainerPage(): ReactElement {
  const video = useVideo()
  const { snippet, id } = video
  const { data } = useQuery<GetVideoChildren>(GET_VIDEO_CHILDREN, {
    variables: { id: id }
  })
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
      <Container maxWidth="xxl">
        <Stack
          spacing={{ xs: 4, md: 11 }}
          py={{ xs: 7, md: 17 }}
          direction="column"
        >
          <ContainerDescription
            value={snippet[0].value}
            openDialog={handleOpenDialog}
          />
          <ShareDialog open={shareDialog} onClose={handleCloseDialog} />
          <Box>
            {data?.video?.children != null && (
              <VideoGrid
                containerSlug={video.slug}
                videos={data.video.children}
                variant="expanded"
              />
            )}
          </Box>
        </Stack>
      </Container>
    </PageWrapper>
  )
}
