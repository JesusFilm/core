import { gql, useQuery } from '@apollo/client'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Error from 'next/error'
import { useRouter } from 'next/router'
import { ReactElement, useState } from 'react'
import { TabPanel, tabA11yProps } from '@core/shared/ui/TabPanel'
import Container from '@mui/material/Container'
import Button from '@mui/material/Button'
import SaveAlt from '@mui/icons-material/SaveAlt'
import Share from '@mui/icons-material/Share'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeName, ThemeMode } from '@core/shared/ui/themes'
import 'video.js/dist/video-js.css'

import { routeParser } from '../src/libs/routeParser/routeParser'
import {
  LanguageProvider,
  useLanguage
} from '../src/libs/languageContext/LanguageContext'
import { PageWrapper } from '../src/components/PageWrapper'
import { VideosCarousel } from '../src/components/Videos/VideosCarousel/VideosCarousel'
import { Footer } from '../src/components/Footer'
import { Header } from '../src/components/Header'
import { VideoHero, SimpleHero } from '../src/components/Hero'

export const GET_VIDEO = gql`
  query GetVideo($id: ID!, $languageId: ID) {
    video(id: $id, idType: slug) {
      id
      type
      image
      description(languageId: $languageId, primary: true) {
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
  const [tabValue, setTabValue] = useState(0)

  const handleTabChange = (_event, newValue): void => {
    setTabValue(newValue)
  }

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
      <PageWrapper header={<Header />} footer={<Footer />}>
        {data?.video != null && (
          <>
            <ThemeProvider
              nested
              themeName={ThemeName.website}
              themeMode={ThemeMode.dark}
            >
              {siblingsData != null ? (
                <VideoHero
                  loading={loading}
                  video={data.video}
                  siblingVideos={siblingsData}
                  routes={routes}
                />
              ) : (
                <SimpleHero loading={loading} video={data.video} />
              )}
            </ThemeProvider>
            <Box
              sx={{
                paddingTop: '20px',
                paddingX: '100px'
              }}
            >
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
            <Container
              style={{
                paddingLeft: 100,
                paddingRight: 100,
                margin: 0,
                marginTop: 20,
                marginBottom: 80,
                maxWidth: '100%'
              }}
            >
              <Stack direction="row" spacing="100px">
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
                      {data.video.description[0]?.value}
                    </Typography>
                  </TabPanel>

                  <TabPanel name="video-transcript" value={tabValue} index={1}>
                    <Typography variant="body1">&nbsp;</Typography>
                  </TabPanel>
                  <TabPanel name="video-strategy" value={tabValue} index={2}>
                    <Typography variant="body1">&nbsp;</Typography>
                  </TabPanel>
                </Box>
                <Box width="336px">
                  <Stack direction="row" spacing="20px" mb="40px">
                    <Button variant="outlined">
                      <SaveAlt />
                      &nbsp; Download
                    </Button>
                    <Button variant="outlined">
                      <Share />
                      &nbsp; Share
                    </Button>
                  </Stack>
                </Box>
              </Stack>
            </Container>
          </>
        )}
      </PageWrapper>
    </LanguageProvider>
  )
}
