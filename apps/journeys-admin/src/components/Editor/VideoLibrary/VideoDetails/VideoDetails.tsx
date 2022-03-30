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
import { gql, useLazyQuery } from '@apollo/client'
import { GetVideo } from '../../../../../__generated__/GetVideo'
import { Drawer as LanguageDrawer } from '../LanguageFilter/Drawer/Drawer'

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
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [openLanguage, setOpenLanguage] = useState<boolean>(false)
  const [selectedIds, setSelectedIds] = useState(['529'])
  const [loadVideo, { data }] = useLazyQuery<GetVideo>(GET_VIDEO, {
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
        controls: true,
        autoplay: false,
        preload: 'auto',
        poster: data.video.image ?? undefined
      })
      playerRef.current.on('playing', () => {
        setIsPlaying(true)
      })
    }
  }, [data])

  useEffect(() => {
    if (open) {
      void loadVideo()
    }
  }, [open, loadVideo])

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
            onClick={handleClose}
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
          onClick={handleVideoSelect}
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
