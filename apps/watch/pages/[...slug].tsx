import { gql, useQuery } from '@apollo/client'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Error from 'next/error'
import { useRouter } from 'next/router'
import { ReactElement, useEffect, useRef, useState } from 'react'
import { TabPanel, tabA11yProps, secondsToMinutes } from '@core/shared/ui'
import Container from '@mui/material/Container'
import Button from '@mui/material/Button'
import PlayArrow from '@mui/icons-material/PlayArrow'
import AccessTime from '@mui/icons-material/AccessTime'
import Subtitles from '@mui/icons-material/Subtitles'
import Translate from '@mui/icons-material/Translate'
import Circle from '@mui/icons-material/Circle'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import videojs from 'video.js'

import { routeParser } from '../src/libs/routeParser/routeParser'
import { VideoType } from '../__generated__/globalTypes'
import 'video.js/dist/video-js.css'
import {
  LanguageProvider,
  useLanguage
} from '../src/libs/languageContext/LanguageContext'
import { PageWrapper } from '../src/components/PageWrapper'
import { darkTheme } from '../src/components/ThemeProvider/ThemeProvider'
import { VideoListCarousel } from '../src/components/Videos/VideoList/Carousel/VideoListCarousel'

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

export const GET_LANGUAGE = gql`
  query GetLanguage($id: ID!, $languageId: ID) {
    language(id: $id) {
      id
      name(languageId: $languageId, primary: true) {
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
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<videojs.Player>()
  const locale = router.locale ?? router.defaultLocale
  const { slug } = router.query
  const { routes, tags, audioLanguage, subtitleLanguage } = routeParser(slug)
  const languageContext = useLanguage()
  const [isPlaying, setIsPlaying] = useState(false)
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

  const { data: audioLanguageData } = useQuery(GET_LANGUAGE, {
    variables: {
      id: audioLanguage,
      languageId: router.locale ?? router.defaultLocale
    }
  })

  const { data: subtitleLanguageData } = useQuery(GET_LANGUAGE, {
    variables: {
      id: subtitleLanguage,
      languageId: router.locale ?? router.defaultLocale
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

  useEffect(() => {
    if (videoRef.current != null) {
      playerRef.current = videojs(videoRef.current, {
        autoplay: false,
        controls: true,
        userActions: {
          hotkeys: true,
          doubleClick: true
        },
        controlBar: {
          playToggle: true,
          captionsButton: true,
          subtitlesButton: true,
          remainingTimeDisplay: true,
          progressControl: {
            seekBar: true
          },
          fullscreenToggle: true,
          volumePanel: {
            inline: false
          }
        },
        responsive: true,
        poster: data.video?.image
      })
      playerRef.current.on('pause', pauseVideo)
      playerRef.current.on('play', playVideo)
    }
  })

  if (routes == null) return throw404()

  const siblingRoute = (routes: string[]): string[] => {
    return routes.filter((route, index) => index !== routes.length - 1)
  }

  function playVideo(): void {
    setIsPlaying(true)
    videoRef?.current?.play()
  }

  function pauseVideo(): void {
    setIsPlaying(false)
  }

  return (
    <LanguageProvider>
      <PageWrapper />
      {loading && <CircularProgress />}
      {data?.video != null && (
        <>
          <Box
            sx={{
              backgroundImage: `url(${data.video.image as string})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              height: 776
            }}
          >
            {data.video.variant?.hls != null && (
              <video
                ref={videoRef}
                className="vjs-jfp video-js vjs-fill"
                style={{
                  alignSelf: 'center'
                }}
                playsInline
              >
                <source
                  src={data.video.variant.hls}
                  type="application/x-mpegURL"
                />
              </video>
            )}
            {!isPlaying && (
              <>
                <Container
                  maxWidth="xl"
                  style={{
                    position: 'absolute',
                    top: 350,
                    paddingLeft: 100,
                    margin: 0,
                    textShadow: '0px 3px 4px rgba(0, 0, 0, 0.25)'
                  }}
                >
                  <Typography
                    variant="h2"
                    sx={{
                      maxWidth: '600px',
                      color: darkTheme.palette.text.primary
                    }}
                  >
                    {data.video.title[0]?.value}
                  </Typography>
                </Container>
                <Box
                  sx={{
                    position: 'absolute',
                    top: '520px'
                  }}
                  width="100%"
                  height="133px"
                >
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    px="100px"
                    sx={{ color: darkTheme.palette.text.primary }}
                  >
                    <Stack direction="row" spacing="20px">
                      {data?.video.type === VideoType.playlist && (
                        <Typography variant="subtitle1">
                          {data.video.episodes.length} episodes
                        </Typography>
                      )}
                      {data?.video.type !== VideoType.playlist && (
                        <>
                          <Button
                            size="large"
                            variant="contained"
                            sx={{ height: 71, fontSize: '24px' }}
                            onClick={playVideo}
                          >
                            <PlayArrow />
                            &nbsp; Play Video
                          </Button>
                          <Stack height="71px" direction="row">
                            <AccessTime sx={{ paddingTop: '23px' }} />
                            <Typography
                              variant="body2"
                              sx={{ lineHeight: '71px', paddingLeft: '10px' }}
                            >
                              {secondsToMinutes(data.video.variant.duration)}{' '}
                              min
                            </Typography>
                          </Stack>
                          <Circle
                            sx={{ fontSize: '10px', paddingTop: '30px' }}
                          />
                          <Stack height="71px" direction="row">
                            <Subtitles sx={{ paddingTop: '23px' }} />
                            <Typography
                              variant="body2"
                              sx={{ lineHeight: '71px', paddingLeft: '10px' }}
                            >
                              Subs
                            </Typography>
                          </Stack>
                        </>
                      )}
                    </Stack>
                    <Stack height="71px" direction="row">
                      <Translate sx={{ paddingTop: '23px' }} />
                      <Typography
                        variant="body1"
                        sx={{ paddingLeft: '10px', lineHeight: '71px' }}
                      >
                        {audioLanguageData?.language.name[0]?.value} +{' '}
                        {data.video.variantLanguages.length - 1} Additional
                        Languages
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>
                <Box
                  sx={{
                    backgroundColor: 'rgba(18, 17, 17, 0.25)',
                    position: 'absolute',
                    top: '643px'
                  }}
                  width="100%"
                  height="133px"
                >
                  <Stack pt="34px" mx="100px" width="100%" direction="row">
                    <Stack direction="row">
                      {/* <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    background: 'transparent',
                    color: theme.palette.primary.contrastText,
                    borderColor: theme.palette.primary.contrastText,
                    height: 62,
                    marginX: 2
                  }}
                >
                  <Language />
                  &nbsp;{languageContext?.name[0].value}
                </Button>
                <Link href="/countries" passHref>
                  <Button
                    variant="outlined"
                    size="large"
                    sx={{
                      background: 'transparent',
                      color: theme.palette.primary.contrastText,
                      borderColor: theme.palette.primary.contrastText,
                      height: 62
                    }}
                  >
                    <Place />
                    &nbsp;Language by country
                  </Button>
                </Link> */}
                    </Stack>
                  </Stack>
                </Box>
              </>
            )}
          </Box>
          <Box
            sx={{
              paddingX: '100px',
              bgcolor: darkTheme.palette.background.default,
              color: darkTheme.palette.text.primary
            }}
          >
            {data.video.episodes.length > 0 && (
              <VideoListCarousel
                videos={data.video.episodes}
                routePrefix={routes.join('/')}
              />
            )}
            {siblingsData?.episodes?.length > 0 && (
              <VideoListCarousel
                videos={siblingsData.episodes}
                routePrefix={siblingRoute(routes).join('/')}
              />
            )}
          </Box>
          <Box mt="20px">
            <Stack justifyContent="center" direction="row">
              <Box>
                <Tabs
                  value={tabValue}
                  onChange={handleTabChange}
                  aria-label="background tabs"
                  variant="fullWidth"
                  centered
                >
                  <Tab
                    label="Description"
                    {...tabA11yProps('video-description', 0)}
                  />
                  <Tab
                    label="Transcript"
                    {...tabA11yProps('video-transcript', 1)}
                  />
                  <Tab
                    label="Strategy"
                    {...tabA11yProps('video-strategy', 1)}
                  />
                </Tabs>
                <TabPanel name="video-description" value={tabValue} index={0}>
                  <Typography variant="body1">
                    {data.video.description[0]?.value}
                  </Typography>
                </TabPanel>
                <TabPanel name="video-transcript" value={tabValue} index={1}>
                  <Typography variant="body1">
                    {data.video.description[0]?.value}
                  </Typography>
                </TabPanel>
                <TabPanel name="video-strategy" value={tabValue} index={2}>
                  <Typography variant="body1">
                    {data.video.description[0]?.value}
                  </Typography>
                </TabPanel>
              </Box>
              <Stack justifyContent="center" direction="column" width="80%">
                {data.video.type !== VideoType.playlist && (
                  <Stack justifyContent="center" direction="row">
                    <Typography variant="subtitle1">
                      Subtitle:
                      {subtitleLanguageData?.language.name[0]?.value}
                    </Typography>
                  </Stack>
                )}
              </Stack>
            </Stack>
          </Box>
        </>
      )}
      <div>Tags - {tags.join(' ')}</div>
    </LanguageProvider>
  )
}
