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
import { GetVideo } from '../../../../../../__generated__/GetVideo'
import { VideoLanguage } from '../../VideoLanguage'
import 'video.js/dist/video-js.css'
import { LanguageSelectOption } from '../../../../LanguageSelect'
import { VideoDetailsProps } from '../../VideoList/VideoListItem/VideoListItem'

export const GET_VIDEO = gql`
  query GetVideo($id: ID!, $languageId: ID!) {
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
      variantLanguages {
        id
        name(languageId: $languageId, primary: true) {
          value
          primary
        }
      }
    }
  }
`

export const DRAWER_WIDTH = 328

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
  const [selectedLanguage, setSelectedLanguage] =
    useState<LanguageSelectOption>({
      id: '529',
      localName: undefined,
      nativeName: 'English'
    })
  const [loadVideo, { data, loading }] = useLazyQuery<GetVideo>(GET_VIDEO, {
    variables: { id, languageId: '529' }
  })

  const handleChange = (selectedLanguage: LanguageSelectOption): void => {
    setSelectedLanguage(selectedLanguage)
  }

  const handleVideoSelect = (): void => {
    handleSelect({
      videoId: id,
      videoVariantLanguageId: selectedLanguage.id,
      startAt: 0,
      endAt: time
    })
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
                    src={data?.video.variant?.hls ?? ''}
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
            >
              Select
            </Button>
          </Stack>
        </Stack>
      </Drawer>
      <VideoLanguage
        open={openLanguage}
        onClose={() => setOpenLanguage(false)}
        onChange={handleChange}
        language={selectedLanguage}
        languages={data?.video.variantLanguages}
        loading={loading}
      />
    </>
  )
}

export default VideoDetails
