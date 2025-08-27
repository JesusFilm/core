import Button from '@mui/material/Button'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Box from '@mui/system/Box'
import { useTranslation } from 'next-i18next'
import fetch from 'node-fetch'
import { ReactElement, useEffect, useRef, useState } from 'react'
import useSWR from 'swr'
import videojs from 'video.js'
import Player from 'video.js/dist/types/player'

import { defaultVideoJsOptions } from '@core/shared/ui/defaultVideoJsOptions'
import CheckIcon from '@core/shared/ui/icons/Check'

import { VideoBlockSource } from '../../../../../../../../../__generated__/globalTypes'
import { parseISO8601Duration } from '../../../../../../../../libs/parseISO8601Duration'
import { VideoDescription } from '../../VideoDescription'
import type { VideoDetailsProps } from '../../VideoDetails/VideoDetails'
import type { YoutubeVideo, YoutubeVideosData } from '../VideoFromYouTube'

import 'video.js/dist/video-js.css'

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
  const { t } = useTranslation('apps-journeys-admin')
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<Player | null>(null)
  const [playing, setPlaying] = useState(false)
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

  useEffect(() => {
    if (videoRef.current != null) {
      playerRef.current = videojs(videoRef.current, {
        ...defaultVideoJsOptions,
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
    <Stack spacing={4} sx={{ p: 6 }} data-testid="YoutubeDetails">
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
              overflow: 'hidden',
              '& .vjs-poster img': {
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }
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
            <Box sx={{ display: 'inline', position: 'relative' }}>
              <VideoDescription videoDescription={videoDescription} />
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
          startIcon={<CheckIcon />}
          onClick={handleSelect}
          size="small"
          disabled={loading}
          sx={{ backgroundColor: 'secondary.dark' }}
        >
          {t('Select')}
        </Button>
      </Stack>
    </Stack>
  )
}

export default YouTubeDetails
