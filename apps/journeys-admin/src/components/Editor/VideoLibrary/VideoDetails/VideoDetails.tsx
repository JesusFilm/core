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
import { gql, useQuery } from '@apollo/client'
import { GetVideo } from '../../../../../__generated__/GetVideo'
import { Drawer as LanguageDrawer } from '../LanguageFilter/Drawer/Drawer'

export const GET_VIDEO = gql`
  query GetVideo($videoId: String!) {
    video(videoId: $videoId) {
      id
      image
      title {
        primary
        value
      }
      description {
        primary
        value
      }
      variant {
        duration
        hls
      }
    }
  }
`

export const DRAWER_WIDTH = 328
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
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<videojs.Player>()
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [openLanguage, setOpenLanguage] = useState<boolean>(false)
  const [selectedIds, setSelectedIds] = useState(['en'])
  // need to discuss how we're passing langaugeIds around
  const handleChange = (selectedIds: string[]): void => {
    setSelectedIds(selectedIds)
    // onSelect(selectedIds)
  }

  const onSelect = (id: string): void => {
    if (handleSelect != null) handleSelect(id)
    if (handleOpen != null) handleOpen()
  }

  const { data } = useQuery<GetVideo>(GET_VIDEO, {
    variables: { videoId }
  })

  const time = data?.video.variant?.duration ?? 0
  const duration =
    time < 3600
      ? new Date(time * 1000).toISOString().substring(14, 19)
      : new Date(time * 1000).toISOString().substring(11, 19)

  useEffect(() => {
    if (videoRef.current != null && data != null) {
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
        poster: data.video.image ?? ''
      })
      playerRef.current.on('playing', () => {
        setIsPlaying(true)
      })
    }
  }, [data])

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
          data-testid={`VideoDetails-${data?.video.id ?? ''}`}
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
              src={data?.video.variant?.hls}
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
              {duration}
            </Typography>
          )}
        </Box>
        <Box sx={{ pb: 2, pt: 5 }}>
          <Typography variant="subtitle1">
            {data?.video?.title?.find(({ primary }) => primary)?.value}
          </Typography>
        </Box>
        <Typography variant="caption">
          {data?.video?.description?.find(({ primary }) => primary)?.value}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mx: 4 }}>
        <Button
          data-testid="VideoDetailsLanguageButton"
          variant="contained"
          size="small"
          onClick={() => setOpenLanguage(true)}
          endIcon={<ArrowDropDown />}
        >
          Other Languages
        </Button>
        <Button
          data-testid="VideoDetailsSelectButton"
          variant="contained"
          size="small"
          startIcon={<Check />}
          onClick={
            onSelect != null
              ? () => onSelect(data?.video.variant?.hls ?? '')
              : undefined
          }
        >
          Select Video
        </Button>
      </Box>
      <LanguageDrawer
        open={openLanguage}
        onClose={() => setOpenLanguage(false)}
        onChange={handleChange}
        selectedIds={selectedIds}
        currentLanguageId="529"
      />
    </Drawer>
  )
}

export default VideoDetails
