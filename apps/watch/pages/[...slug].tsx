import { gql, useQuery } from '@apollo/client'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Error from 'next/error'
import { useRouter } from 'next/router'
import { ReactElement, useState } from 'react'
import Button from '@mui/material/Button'
import SaveAlt from '@mui/icons-material/SaveAlt'
import Share from '@mui/icons-material/Share'
import 'video.js/dist/video-js.css'

import { routeParser } from '../src/libs/routeParser/routeParser'
import {
  LanguageProvider,
  useLanguage
} from '../src/libs/languageContext/LanguageContext'
import { PageWrapper } from '../src/components/PageWrapper'
import { VideosCarousel } from '../src/components/Videos/VideosCarousel/VideosCarousel'
import { VideoHero, SimpleHero } from '../src/components/Hero'
import { ShareDialog } from '../src/components/ShareDialog'
import { VideoContent } from '../src/components/Video/VideoContent'

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
      episodes {
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
        episodeIds
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
  query GetVideoSiblings($playlistId: ID!, $languageId: ID) {
    episodes(playlistId: $playlistId, idType: slug) {
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
      episodeIds
      slug(languageId: $languageId, primary: true) {
        value
      }
    }
  }
`

export const throw404 = (): ReactElement => {
  return <Error statusCode={404} />
}

export default function SeoFriendly(): ReactElement {
  const router = useRouter()
  const { slug } = router.query
  const { routes } = routeParser(slug)
  const languageContext = useLanguage()
  const [openShare, setOpenShare] = useState(false)

  const { data, loading } = useQuery(GET_VIDEO, {
    variables: {
      id: routes?.[routes.length - 1],
      languageId: languageContext?.id ?? '529'
    }
  })

  const playlistId = routes?.[routes.length - 2]
  const { data: siblingsData } = useQuery(GET_VIDEO_SIBLINGS, {
    skip: playlistId == null,
    variables: {
      playlistId: playlistId ?? '',
      languageId: router.locale ?? router.defaultLocale
    }
  })

  if (routes == null) return throw404()

  const getSiblingRoute = (routes: string[]): string[] => {
    return routes.filter((route, index) => index !== routes.length - 1)
  }

  return (
    <LanguageProvider>
      <PageWrapper
        hero={
          data?.video == null ? (
            <></>
          ) : siblingsData != null ? (
            <VideoHero
              loading={loading}
              video={data.video}
              siblingVideos={siblingsData}
              routes={routes}
            />
          ) : (
            <SimpleHero loading={loading} video={data.video} />
          )
        }
      >
        {data?.video != null && (
          <>
            <Box sx={{ pt: '20px' }}>
              {data.video.episodes.length > 0 && (
                <VideosCarousel
                  videos={data.video.episodes}
                  routePrefix={routes.join('/')}
                />
              )}
              {siblingsData?.episodes?.length > 0 && (
                <VideosCarousel
                  videos={siblingsData.episodes}
                  routePrefix={getSiblingRoute(routes).join('/')}
                />
              )}
            </Box>
            <Stack
              direction="row"
              spacing="100px"
              sx={{
                mx: 0,
                mt: 19.5,
                mb: 19.5,
                maxWidth: '100%'
              }}
            >
              <VideoContent video={data.video} />
              <Box
                width="336px"
                sx={{
                  display: { xs: 'none', md: 'block' }
                }}
              >
                <Stack direction="row" spacing={5} mb={10}>
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
              video={data.video}
              routes={routes}
              onClose={() => setOpenShare(false)}
            />
          </>
        )}
      </PageWrapper>
    </LanguageProvider>
  )
}
