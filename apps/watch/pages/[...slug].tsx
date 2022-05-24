import { gql, useQuery } from '@apollo/client'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Error from 'next/error'
import { useRouter } from 'next/router'
import { ReactElement, useEffect, useRef } from 'react'
import { secondsToMinutes } from '@core/shared/ui'
import Container from '@mui/material/Container'
import Button from '@mui/material/Button'
import PlayArrow from '@mui/icons-material/PlayArrow'
import AccessTime from '@mui/icons-material/AccessTime'
import Subtitles from '@mui/icons-material/Subtitles'
import Circle from '@mui/icons-material/Circle'
import videojs from 'video.js'

import { routeParser } from '../src/libs/routeParser/routeParser'
import { VideoType } from '../__generated__/globalTypes'
import 'video.js/dist/video-js.css'
import { VideoListList } from '../src/components/Videos/VideoList/List/VideoListList'
import {
  LanguageProvider,
  useLanguage
} from '../src/libs/languageContext/LanguageContext'
import { PageWrapper } from '../src/components/PageWrapper'
import { theme } from '../src/components/ThemeProvider/ThemeProvider'
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
            inline: true
          }
        },
        responsive: true,
        poster: data.video?.image
      })
    }
  })

  if (routes == null) return throw404()

  const siblingRoute = (routes: string[]): string[] => {
    return routes.filter((route, index) => index !== routes.length - 1)
  }

  return (
    <div>
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
              <Container
                maxWidth="xl"
                style={{
                  position: 'absolute',
                  top: 350,
                  paddingLeft: 100,
                  margin: 0
                }}
              >
                <Typography
                  variant="h2"
                  color={theme.palette.secondary.contrastText}
                  sx={{ maxWidth: '600px' }}
                >
                  {data.video.title[0]?.value}
                </Typography>
              </Container>
              <Box
                sx={{
                  position: 'absolute',
                  top: '520px',
                  paddingLeft: '100px',
                  color: theme.palette.primary.contrastText
                }}
                width="100%"
                height="133px"
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
                          {secondsToMinutes(data.video.variant.duration)} min
                        </Typography>
                      </Stack>
                      <Circle sx={{ fontSize: '10px', paddingTop: '30px' }} />
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
            </Box>
            <Box sx={{ paddingX: '100px' }}>
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
              <Box mt="20px">
                <Stack justifyContent="center" direction="row">
                  <Stack justifyContent="center" direction="column" width="80%">
                    {data.video.variant?.hls != null && (
                      <video
                        ref={videoRef}
                        className="video-js vjs-fluid"
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
                    {data.video.type !== VideoType.playlist && (
                      <Stack justifyContent="center" direction="row">
                        <Typography variant="subtitle1">
                          {secondsToMinutes(data.video.variant.duration)} min
                        </Typography>
                        <Typography variant="subtitle1" mx={4}>
                          Audio:
                          {audioLanguageData?.language.name[0]?.value}
                        </Typography>
                        <Typography variant="subtitle1">
                          Subtitle:
                          {subtitleLanguageData?.language.name[0]?.value}
                        </Typography>
                      </Stack>
                    )}

                    <Typography variant="caption">
                      {data.video.description[0]?.value}
                    </Typography>
                  </Stack>
                </Stack>
              </Box>
            </Box>
          </>
        )}
        <div>Locale - {locale} </div>
        <div>Tags - {tags.join(' ')}</div>
      </LanguageProvider>
    </div>
  )
}
