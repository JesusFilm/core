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
import ArrowDropDown from '@mui/icons-material/ArrowDropDown'
import Check from '@mui/icons-material/Check'
import Close from '@mui/icons-material/Close'
import { arclightMediaUnits } from '../VideoList/VideoListData'

export const DRAWER_WIDTH = 328

interface VideoDetailsContentProps {
  videoId: string
  handleOpen?: () => void
  onSelect?: (id: string) => void
}

export function VideoDetailsContent({
  videoId,
  handleOpen,
  onSelect
}: VideoDetailsContentProps): ReactElement {
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<videojs.Player>()
  const [isPlaying, setIsPlaying] = useState<boolean>(false)

  // to be replaced with the query
  const arclightVideo = arclightMediaUnits.nodes.find(
    (arclight) => arclight.uuid === videoId
  )

  const handleOnClick = (): void => {
    if (onSelect != null) onSelect(videoId)
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
        poster: arclightVideo?.visuals.nodes.find(
          (arclight) => arclight.visualType === 'THUMBNAIL'
        )?.url
      })
      playerRef.current.on('playing', () => {
        setIsPlaying(true)
      })
    }
  }, [arclightVideo])

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
              type="application/x-mpegURL"
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
        <Box sx={{ pb: 2, pt: 5 }}>
          <Typography variant="subtitle1">
            {
              arclightVideo?.descriptors.nodes.find(
                (type) => type.descriptorType === 'TITLE'
              )?.value
            }
          </Typography>
        </Box>
        <Typography variant="caption">
          {
            arclightVideo?.descriptors.nodes.find(
              (type) => type.descriptorType === 'DESCRIPTION'
            )?.value
          }
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mx: 4 }}>
        <Button
          data-testid="VideoDetailsLanguageButton"
          variant="contained"
          size="medium"
          onClick={() => console.log('open language drawer')}
          endIcon={<ArrowDropDown />}
          sx={{ mr: 2 }}
        >
          Other Languages
        </Button>
        <Button
          data-testid="VideoDetailsSelectButton"
          variant="contained"
          size="medium"
          startIcon={<Check />}
          onClick={handleOnClick}
        >
          Select Video
        </Button>
      </Box>
    </>
  )
}

interface VideoDetailsProps {
  open: boolean
  videoId: string
  handleOpen?: () => void
  onSelect?: (id: string) => void
}

export function VideoDetails({
  open,
  videoId,
  handleOpen,
  onSelect: handleSelect
}: VideoDetailsProps): ReactElement {
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))

  const onSelect = (id: string): void => {
    if (handleSelect != null) handleSelect(id)
    if (handleOpen != null) handleOpen()
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
