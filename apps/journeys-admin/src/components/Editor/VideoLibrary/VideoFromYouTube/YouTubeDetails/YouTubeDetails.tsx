import videojs from 'video.js'
import { ReactElement, useEffect, useRef, useState } from 'react'
import Typography from '@mui/material/Typography'
import Box from '@mui/system/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Check from '@mui/icons-material/Check'
import Skeleton from '@mui/material/Skeleton'
import 'video.js/dist/video-js.css'
import useSWR from 'swr'
import fetch from 'node-fetch'
import {
  parseISO8601Duration,
  YoutubeVideo,
  YoutubeVideosData
} from '../VideoFromYouTube'
import { VideoBlockSource } from '../../../../../../__generated__/globalTypes'
import type { VideoDetailsProps } from '../../VideoDetails/VideoDetails'

const fetcher = async (id: string): Promise<YoutubeVideo> => {
  const videosQuery = new URLSearchParams({
    part: 'snippet,contentDetails',
    key: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? '',
    id
  }).toString()
  const videosData: YoutubeVideosData = await (
    await fetch(`https://www.googleapis.com/youtube/v3/videos?${videosQuery}`)
  ).json()
  return videosData.items[0] as YoutubeVideo
}

export function YouTubeDetails({
  open,
  id,
  onSelect
}: Pick<VideoDetailsProps, 'open' | 'id' | 'onSelect'>): ReactElement {
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<videojs.Player>()
  const [playing, setPlaying] = useState(false)
  const [displayMore, setDisplayMore] = useState(false)
  const { data, error } = useSWR<YoutubeVideo>(
    () => (open ? id : null),
    fetcher
  )

  const handleSelect = (): void => {
    onSelect({
      videoId: id,
      source: VideoBlockSource.youTube,
      startAt: 0,
      endAt: time
    })
  }

  const time =
    data != null ? parseISO8601Duration(data.contentDetails.duration) : 0
  const duration =
    time < 3600
      ? new Date(time * 1000).toISOString().substring(14, 19)
      : new Date(time * 1000).toISOString().substring(11, 19)

  const videoDescription = data?.snippet.description ?? ''

  const videoDescriptionMaxLength = 139

  useEffect(() => {
    if (videoRef.current != null) {
      playerRef.current = videojs(videoRef.current, {
        fluid: true,
        controls: true,
        poster: data?.snippet?.thumbnails?.default?.url ?? undefined
      })
      playerRef.current.on('playing', () => {
        setPlaying(true)
      })
    }
  }, [data])

  const loading = data == null && error == null

  return (
    <Stack spacing={4} sx={{ p: 6 }}>
      {loading ? (
        <>
          <Skeleton variant="rectangular" width="100%" sx={{ borderRadius: 2 }}>
            <div style={{ paddingTop: '57%' }} />
          </Skeleton>
          <Box>
            <Typography variant="subtitle1">
              <Skeleton variant="text" width="65%" />
            </Typography>
            <Typography variant="caption">
              <Skeleton variant="text" />
              <Skeleton variant="text" />
              <Skeleton variant="text" width="85%" />
            </Typography>
          </Box>
        </>
      ) : (
        <>
          <Box
            sx={{
              borderRadius: 3,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <video
              ref={videoRef}
              className="video-js vjs-big-play-centered"
              playsInline
            >
              <source
                src={`https://www.youtube.com/watch?v=${id}`}
                type="video/youtube"
              />
            </video>
            {!playing && (
              <Typography
                component="div"
                variant="caption"
                sx={{
                  color: 'background.paper',
                  backgroundColor: 'rgba(0, 0, 0, 0.35)',
                  px: 1,
                  borderRadius: 2,
                  position: 'absolute',
                  right: 20,
                  bottom: 10,
                  zIndex: 1
                }}
              >
                {duration}
              </Typography>
            )}
          </Box>
          <Box>
            <Typography variant="subtitle1">{data?.snippet.title}</Typography>
            <Box sx={{ display: 'inline' }}>
              <Box
                sx={{
                  height:
                    !displayMore &&
                    videoDescription.length > videoDescriptionMaxLength
                      ? '70px'
                      : 'auto',
                  overflow: 'hidden',
                  position: 'relative'
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    position: 'relative',
                    whiteSpace: 'normal'
                  }}
                >
                  {videoDescription}
                  {videoDescription.length > videoDescriptionMaxLength &&
                    displayMore && (
                      <Button
                        variant="text"
                        size="small"
                        sx={{
                          background:
                            'linear-gradient(90deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.93) 17%, rgba(255,255,255,1) 29%)',
                          color: 'secondary.light',
                          scale: '0.9',
                          position: 'relative',
                          bottom: 1.7,
                          right: 2,
                          padding: '0',
                          '&:hover': {
                            background:
                              'linear-gradient(90deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.93) 17%, rgba(255,255,255,1) 29%)'
                          }
                        }}
                        onClick={() => setDisplayMore(!displayMore)}
                      >
                        Less
                      </Button>
                    )}
                </Typography>
                {videoDescription.length > videoDescriptionMaxLength && (
                  <Button
                    variant="text"
                    size="small"
                    sx={{
                      background:
                        'linear-gradient(90deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.93) 17%, rgba(255,255,255,1) 29%)',
                      color: 'secondary.light',
                      position: 'absolute',
                      bottom: -2.5,
                      right: -4,
                      scale: '0.9',
                      padding: '0',
                      display: !displayMore ? 'inline' : 'none',
                      zIndex: '2',
                      '&:hover': {
                        background:
                          'linear-gradient(90deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.93) 17%, rgba(255,255,255,1) 29%)'
                      }
                    }}
                    onClick={() => setDisplayMore(!displayMore)}
                  >
                    More
                  </Button>
                )}
              </Box>
            </Box>
          </Box>
        </>
      )}
      <Stack
        direction="row"
        spacing={2}
        sx={{ justifyContent: 'space-between' }}
      >
        <Button
          variant="contained"
          startIcon={<Check />}
          onClick={handleSelect}
          size="small"
          disabled={loading}
          sx={{ backgroundColor: 'secondary.dark' }}
        >
          Select
        </Button>
      </Stack>
    </Stack>
  )
}

export default YouTubeDetails
