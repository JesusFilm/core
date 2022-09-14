import videojs from 'video.js'
import { ReactElement, useEffect, useRef, useState } from 'react'
import Typography from '@mui/material/Typography'
import Box from '@mui/system/Box'
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import Stack from '@mui/material/Stack'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Theme } from '@mui/material/styles'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import Check from '@mui/icons-material/Check'
import Close from '@mui/icons-material/Close'
import Skeleton from '@mui/material/Skeleton'
import 'video.js/dist/video-js.css'
import useSWR from 'swr'
import { VideoDetailsProps } from '../../VideoList/VideoListItem/VideoListItem'
import { parseISO8601Duration, YoutubeVideosData } from '../VideoFromYouTube'
import { VideoBlockSource } from '../../../../../../__generated__/globalTypes'

export const DRAWER_WIDTH = 328

const fetcher = async (
  id: string
): Promise<YoutubeVideosData['items'][number]> => {
  console.log(id)
  const videosQuery = new URLSearchParams({
    part: 'snippet,contentDetails',
    key: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? '',
    id
  }).toString()
  const videosData: YoutubeVideosData = await (
    await fetch(`https://www.googleapis.com/youtube/v3/videos?${videosQuery}`)
  ).json()
  return videosData.items[0]
}

export function VideoDetails({
  open,
  id,
  onClose: handleClose,
  onSelect: handleSelect
}: VideoDetailsProps): ReactElement {
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<videojs.Player>()
  const [playing, setPlaying] = useState(false)
  const { data, error } = useSWR<YoutubeVideosData['items'][number]>(
    () => (open ? id : null),
    fetcher
  )

  const handleVideoSelect = (): void => {
    handleSelect({
      videoId: id,
      source: VideoBlockSource.youTube,
      startAt: 0,
      endAt: time
    })
    handleClose()
  }

  const time =
    data != null ? parseISO8601Duration(data.contentDetails.duration) : 0
  const duration =
    time < 3600
      ? new Date(time * 1000).toISOString().substring(14, 19)
      : new Date(time * 1000).toISOString().substring(11, 19)

  useEffect(() => {
    if (videoRef.current != null) {
      playerRef.current = videojs(videoRef.current, {
        fluid: true,
        controls: true
      })
      playerRef.current.on('playing', () => {
        setPlaying(true)
      })
    }
  }, [data])

  const loading = data == null && error != null

  return (
    <>
      <Drawer
        anchor={smUp ? 'right' : 'bottom'}
        variant="temporary"
        open={open}
        elevation={smUp ? 1 : 0}
        hideBackdrop
        sx={{
          display: { xs: smUp ? 'none' : 'block', sm: smUp ? 'block' : 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: smUp ? DRAWER_WIDTH : '100%',
            height: '100%'
          }
        }}
      >
        <AppBar position="static" color="default">
          <Toolbar variant="dense">
            <Typography
              variant="subtitle1"
              noWrap
              component="div"
              sx={{ flexGrow: 1 }}
            >
              Video Details
            </Typography>
            <IconButton
              onClick={handleClose}
              sx={{ display: 'inline-flex' }}
              edge="end"
              aria-label="Close"
            >
              <Close />
            </IconButton>
          </Toolbar>
        </AppBar>
        <Stack spacing={4} sx={{ p: 6 }}>
          {loading ? (
            <>
              <Skeleton
                variant="rectangular"
                width={280}
                height={150}
                sx={{ borderRadius: 2 }}
              />
              <Typography variant="subtitle1">
                <Skeleton variant="text" />
              </Typography>
              <Typography variant="caption">
                <Skeleton variant="text" />
                <Skeleton variant="text" />
                <Skeleton variant="text" width="85%" />
              </Typography>
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
                  className="video-js"
                  data-setup={`{ "techOrder": ["youtube"], "sources": [{ "type": "video/youtube", "src": "https://www.youtube.com/watch?v=${id}"}] }`}
                />
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
                <Typography variant="subtitle1">
                  {data?.snippet.title}
                </Typography>
                <Typography variant="caption" sx={{ whiteSpace: 'pre-wrap' }}>
                  {data?.snippet.description}
                </Typography>
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
              onClick={handleVideoSelect}
              size="small"
              disabled={loading}
            >
              Select
            </Button>
          </Stack>
        </Stack>
      </Drawer>
    </>
  )
}

export default VideoDetails
