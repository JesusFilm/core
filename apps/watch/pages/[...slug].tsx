import { gql, useQuery } from '@apollo/client'
import Error from 'next/error'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { ReactElement, useEffect, useRef } from 'react'
import { secondsToMinutes } from '@core/shared/ui'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import videojs from 'video.js'

import { routeParser } from '../src/libs/routeParser/routeParser'
import 'video.js/dist/video-js.css'

export const GET_VIDEO = gql`
  query GetVideo($id: ID!) {
    video(id: $id, idType: slug) {
      id
      image
      description {
        primary
        value
      }
      title {
        primary
        value
      }
      variant {
        duration
        hls
      }
      episodeIds
      seoTitle
    }
  }
`
export const GET_LANGUAGE = gql`
  query GetLanguage($id: ID!) {
    language(id: $id) {
      id
      name {
        primary
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

  const { data, loading } = useQuery(GET_VIDEO, {
    variables: { id: routes?.[routes.length - 1] }
  })

  const { data: audioLanguageData } = useQuery(GET_LANGUAGE, {
    variables: { id: audioLanguage }
  })

  const { data: subtitleLanguageData } = useQuery(GET_LANGUAGE, {
    variables: { id: subtitleLanguage }
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

  return (
    <div>
      {loading && <CircularProgress />}
      {data?.video != null && (
        <>
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              margin: '-5%',
              width: '100vw !important',
              height: '100%',
              filter: 'blur(20px)',
              overflow: 'hidden',
              zIndex: 0,
              opacity: 0.4
            }}
          >
            <Image
              src={data.video.image}
              layout="fill"
              alt={data.video.title.find((title) => title.primary)?.value}
            />
          </Box>
          <Box>
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
                <Stack justifyContent="center" direction="row">
                  <Typography variant="h1">
                    {data.video.title.find((title) => title.primary)?.value}
                  </Typography>
                </Stack>
                {data.video.playlist == null && (
                  <Stack justifyContent="center" direction="row">
                    <Typography variant="subtitle1">
                      {secondsToMinutes(data.video.variant.duration)} min
                    </Typography>
                    <Typography variant="subtitle1" mx={4}>
                      Audio:
                      {
                        audioLanguageData?.language.name.find((n) => n.primary)
                          ?.value
                      }
                    </Typography>
                    <Typography variant="subtitle1">
                      Subtitle:
                      {
                        subtitleLanguageData?.language.name.find(
                          (n) => n.primary
                        )?.value
                      }
                    </Typography>
                  </Stack>
                )}
                {data?.video.playlist != null && (
                  <Typography variant="subtitle1">
                    {data.video.playlist.length} episodes
                  </Typography>
                )}
                <Typography variant="caption">
                  {data.video.description.find((d) => d.primary).value}
                </Typography>
              </Stack>
            </Stack>
          </Box>
        </>
      )}
      <div>Locale - {locale} </div>
      <div>Tags - {tags.join(' ')}</div>
    </div>
  )
}
