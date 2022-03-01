import videojs from 'video.js'
import { ReactElement, useEffect, useRef, useState } from 'react'
import Typography from '@mui/material/Typography'
import Box from '@mui/system/Box'
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Theme } from '@mui/material/styles'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import Close from '@mui/icons-material/Close'

export const DRAWER_WIDTH = 328

interface VideoDetailsContentProps {
  videoId: string
  handleOpen: () => void
  onSelect: (id: string) => void
}

export function VideoDetailsContent({
  videoId,
  handleOpen,
  onSelect
}: VideoDetailsContentProps): ReactElement {
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<videojs.Player>()
  const [isPlaying, setIsPlaying] = useState<boolean>(false)

  const handleOnClick = (): void => {
    onSelect(videoId)
  }

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
        muted: true,
        poster:
          'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1631&q=80'
      })
      playerRef.current.on('playing', () => {
        setIsPlaying(true)
      })
    }
  }, [])

  return (
    <>
      <AppBar position="static" color="default">
        <Toolbar>
          <Typography
            variant="subtitle1"
            noWrap
            component="div"
            sx={{ flexGrow: 1 }}
          >
            Video Details
          </Typography>
          <IconButton
            onClick={handleOpen}
            sx={{ display: 'inline-flex' }}
            edge="end"
          >
            <Close />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          px: { xs: 6, sm: 3 },
          py: 4
        }}
      >
        <Box
          sx={{
            display: 'flex',
            height: 169,
            borderRadius: 3,
            position: 'relative',
            overflow: 'hidden',
            '> .video-js': {
              width: '100%'
            }
          }}
        >
          <video
            ref={videoRef}
            className="video-js vjs-big-play-centered"
            style={{ display: 'flex', alignSelf: 'center', height: '100%' }}
            playsInline
          >
            <source
              src={
                'https://playertest.longtailvideo.com/adaptive/elephants_dream_v4/index.m3u8'
              }
              // type={
              //   videoContent.__typename === 'VideoArclight'
              //     ? 'application/x-mpegURL'
              //     : undefined
              // }
            />
          </video>
          {!isPlaying && (
            <Typography
              component="div"
              variant="caption"
              sx={{
                color: 'background.paper',
                backgroundColor: 'rgba(0, 0, 0, 0.35)',
                m: 2,
                px: 1,
                borderRadius: 2,
                position: 'absolute',
                right: 1,
                bottom: 1,
                zIndex: 1
              }}
            >
              1:32
            </Typography>
          )}
        </Box>
        <Box sx={{ py: 2 }}>
          <Typography variant="subtitle1">NUA - Episode: Decision</Typography>
        </Box>
        <Typography variant="caption">
          Follow the journey of a curious Irishman traveling around the world
          looking for answers and wrestling with the things that just don’t seem
          to make sense.{' '}
        </Typography>
      </Box>
      <Button
        variant="contained"
        size="medium"
        onClick={handleOnClick}
        sx={{
          mt: 3,
          mx: 'auto'
        }}
      >
        Select Video
      </Button>
    </>
  )
}

interface VideoDetailsProps {
  open: boolean
  videoId: string
  handleOpen: () => void
  onSelect: (id: string) => void
}

export function VideoDetails({
  open,
  videoId,
  handleOpen,
  onSelect: handleSelect
}: VideoDetailsProps): ReactElement {
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))

  const onSelect = (id: string): void => {
    handleSelect(id)
    handleOpen()
  }

  return (
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
      <VideoDetailsContent
        videoId={videoId}
        handleOpen={handleOpen}
        onSelect={onSelect}
      />
    </Drawer>
  )
}

export default VideoDetails
