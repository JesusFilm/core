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
import ArrowDropDown from '@mui/icons-material/ArrowDropDown'
import Check from '@mui/icons-material/Check'
import Close from '@mui/icons-material/Close'
import Chip from '@mui/material/Chip'
import Skeleton from '@mui/material/Skeleton'
import { gql, useLazyQuery } from '@apollo/client'
import { GetVideo } from '../../../../../__generated__/GetVideo'
import { Drawer as LanguageDrawer } from '../LanguageFilter/Drawer/Drawer'
import 'video.js/dist/video-js.css'

export const GET_VIDEO = gql`
  query GetVideo($id: ID!) {
    video(id: $id) {
      id
      image
      primaryLanguageId
      title {
        primary
        value
      }
      description {
        primary
        value
      }
      variant {
        id
        duration
        hls
      }
    }
  }
`

export const DRAWER_WIDTH = 328
interface VideoDetailsProps {
  open: boolean
  id: string
  onClose: () => void
  onSelect: (videoId: string, videoVariantLanguageId?: string) => void
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
  const [openLanguage, setOpenLanguage] = useState(false)
  const [selectedIds, setSelectedIds] = useState(['529'])
  const [loadVideo, { data, loading }] = useLazyQuery<GetVideo>(GET_VIDEO, {
    variables: { id }
  })

  const handleChange = (selectedIds: string[]): void => {
    setSelectedIds(selectedIds)
  }

  const handleVideoSelect = (): void => {
    handleSelect(id, data?.video?.primaryLanguageId)
    handleClose()
  }

  const time = data?.video.variant?.duration ?? 0
  const duration =
    time < 3600
      ? new Date(time * 1000).toISOString().substring(14, 19)
      : new Date(time * 1000).toISOString().substring(11, 19)

  useEffect(() => {
    if (videoRef.current != null && data != null) {
      playerRef.current = videojs(videoRef.current, {
        fluid: true,
        controls: true,
        poster: data.video.image ?? undefined
      })
      playerRef.current.on('playing', () => {
        setPlaying(true)
      })
    }
  }, [data])

  useEffect(() => {
    if (open) {
      void loadVideo()
    }
  }, [open, loadVideo])

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
                  className="video-js vjs-big-play-centered"
                  playsInline
                >
                  <source
                    src={data?.video.variant?.hls}
                    type="application/x-mpegURL"
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
                <Typography variant="subtitle1">
                  {data?.video?.title?.find(({ primary }) => primary)?.value}
                </Typography>
                <Typography variant="caption">
                  {
                    data?.video?.description?.find(({ primary }) => primary)
                      ?.value
                  }
                </Typography>
              </Box>
            </>
          )}
          <Stack
            direction="row"
            spacing={2}
            sx={{ justifyContent: 'space-between' }}
          >
            <Chip
              label="Other Languages"
              onClick={() => setOpenLanguage(true)}
              avatar={<ArrowDropDown />}
              disabled={loading}
            />
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
      <LanguageDrawer
        open={openLanguage}
        onClose={() => setOpenLanguage(false)}
        onChange={handleChange}
        selectedIds={selectedIds}
        currentLanguageId="529"
      />
    </>
  )
}

export default VideoDetails
