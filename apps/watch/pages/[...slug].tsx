import { gql } from '@apollo/client'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement, useState } from 'react'
import { TabPanel, tabA11yProps } from '@core/shared/ui/TabPanel'
import Button from '@mui/material/Button'
import SaveAlt from '@mui/icons-material/SaveAlt'
import Share from '@mui/icons-material/Share'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import 'video.js/dist/video-js.css'
import { GetStaticPaths, GetStaticProps } from 'next'

import { LanguageProvider } from '../src/libs/languageContext/LanguageContext'
import { GetVideo, GetVideo_video as Video } from '../__generated__/GetVideo'
import {
  GetVideoSiblings,
  GetVideoSiblings_video_children
} from '../__generated__/GetVideoSiblings'
import { PageWrapper } from '../src/components/PageWrapper'
import { VideosCarousel } from '../src/components/Videos/VideosCarousel/VideosCarousel'
import { VideoHero, SimpleHero } from '../src/components/Hero'
import { ShareDialog } from '../src/components/ShareDialog'
import { createApolloClient } from '../src/libs/client'

interface Props {
  video: Video
  siblings: GetVideoSiblings_video_children[] | null
  routes: string[]
}

export default function SeoFriendly({
  video,
  siblings,
  routes
}: Props): ReactElement {
  const [tabValue, setTabValue] = useState(0)
  const [openShare, setOpenShare] = useState(false)

  const handleTabChange = (_event, newValue): void => {
    setTabValue(newValue)
  }

  const getSiblingRoute = (routes: string[]): string[] => {
    return routes.filter((route, index) => index !== routes.length - 1)
  }

  return (
    <LanguageProvider>
      <PageWrapper
        hero={
          siblings != null ? (
            <VideoHero video={video} siblingVideos={siblings} routes={routes} />
          ) : (
            <SimpleHero video={video} />
          )
        }
      >
        <>
          <Box sx={{ pt: '20px' }}>
            {video.children.length > 0 && (
              <VideosCarousel
                videos={video.children}
                routePrefix={routes.join('/')}
              />
            )}
            {siblings != null && siblings?.length > 0 && (
              <VideosCarousel
                videos={siblings}
                routePrefix={getSiblingRoute(routes).join('/')}
              />
            )}
          </Box>

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
            <Box width="100%">
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label="background tabs"
                variant="fullWidth"
                centered
                sx={{ marginBottom: '40px' }}
              >
                <Tab
                  label="Description"
                  {...tabA11yProps('video-description', 0)}
                />
              </Tabs>
              <TabPanel name="video-description" value={tabValue} index={0}>
                <Typography variant="body1">
                  {video.description[0]?.value}
                </Typography>
              </TabPanel>
            </Box>
            <Box width="336px">
              <Stack direction="row" spacing="20px" mb="40px">
                <Button variant="outlined">
                  <SaveAlt />
                  &nbsp; Download
                </Button>
                <Button variant="outlined" onClick={() => setOpenShare(true)}>
                  <Share />
                  &nbsp; Share
                </Button>
              </Stack>
            </Box>
          </Stack>
          <ShareDialog
            open={openShare}
            video={video}
            routes={routes}
            onClose={() => setOpenShare(false)}
          />
        </>
      </PageWrapper>
    </LanguageProvider>
  )
}

export const GET_VIDEO = gql`
  query GetVideo($id: ID!, $languageId: ID) {
    video(id: $id, idType: slug) {
      id
      type
      image
      snippet(languageId: $languageId, primary: true) {
        value
      }
      description(languageId: $languageId, primary: true) {
        value
      }
      studyQuestions(languageId: $languageId, primary: true) {
        value
      }
      title(languageId: $languageId, primary: true) {
        value
      }
      variant {
        duration
        hls
      }
      children {
        id
        type
        title(languageId: $languageId, primary: true) {
          value
        }
        image
        imageAlt(languageId: $languageId, primary: true) {
          value
        }
        snippet(languageId: $languageId, primary: true) {
          value
        }
        slug(languageId: $languageId, primary: true) {
          value
        }
        children {
          id
        }
        variant {
          duration
          hls
        }
      }
      slug(languageId: $languageId, primary: true) {
        value
      }
      variantLanguages {
        id
        name(languageId: $languageId, primary: true) {
          value
        }
      }
    }
  }
`

export const GET_VIDEO_SIBLINGS = gql`
  query GetVideoSiblings($id: ID!, $languageId: ID) {
    video(id: $id, idType: slug) {
      id
      children {
        id
        type
        image
        imageAlt(languageId: $languageId, primary: true) {
          value
        }
        snippet(languageId: $languageId, primary: true) {
          value
        }
        title(languageId: $languageId, primary: true) {
          value
        }
        variant {
          duration
          hls
        }
        children {
          id
        }
        slug(languageId: $languageId, primary: true) {
          value
        }
      }
    }
  }
`

export const getStaticProps: GetStaticProps<Props> = async (context) => {
  const apolloClient = createApolloClient()

  const slugs = context.params?.slug
  const routes =
    slugs != null ? (typeof slugs === 'string' ? [slugs] : slugs) : null

  const { data: videoData } = await apolloClient.query<GetVideo>({
    query: GET_VIDEO,
    variables: {
      id: routes?.[routes?.length - 1]
    }
  })

  let siblings: GetVideoSiblings_video_children[] | null = null
  const playlistId = routes?.[routes?.length - 2]
  if (playlistId != null) {
    const { data } = await apolloClient.query<GetVideoSiblings>({
      query: GET_VIDEO_SIBLINGS,
      variables: {
        playlistId
      }
    })
    siblings = data.video.children != null ? data.video.children : null
  }

  if (videoData == null || videoData.video == null || routes == null) {
    return {
      notFound: true,
      revalidate: 60
    }
  } else {
    return {
      props: {
        video: videoData.video,
        siblings,
        routes
      },
      revalidate: 60
    }
  }
}

export const getStaticPaths: GetStaticPaths = () => {
  return {
    paths: [],
    fallback: 'blocking'
  }
}
