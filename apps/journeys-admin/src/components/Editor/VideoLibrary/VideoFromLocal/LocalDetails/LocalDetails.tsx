import videojs from 'video.js'
import { ReactElement, useEffect, useRef, useState } from 'react'
import Typography from '@mui/material/Typography'
import Box from '@mui/system/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import ArrowDropDown from '@mui/icons-material/ArrowDropDown'
import Check from '@mui/icons-material/Check'
import Chip from '@mui/material/Chip'
import Skeleton from '@mui/material/Skeleton'
import SubscriptionsRoundedIcon from '@mui/icons-material/SubscriptionsRounded'
import { gql, useLazyQuery } from '@apollo/client'
import { GetVideo } from '../../../../../../__generated__/GetVideo'
import { VideoLanguage } from '../../VideoLanguage'
import 'video.js/dist/video-js.css'
import { LanguageSelectOption } from '../../../../LanguageSelect'
import type { VideoDetailsProps } from '../../VideoDetails/VideoDetails'

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

export function LocalDetails({
  open,
  id,
  onSelect,
  onClose
}: Pick<
  VideoDetailsProps,
  'open' | 'id' | 'onSelect' | 'onClose'
>): ReactElement {
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

  const handleSelect = (): void => {
    onSelect({
      videoId: id,
      videoVariantLanguageId: selectedLanguage.id,
      startAt: 0,
      endAt: time
    })
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
          <Button
            startIcon={<SubscriptionsRoundedIcon />}
            size="small"
            onClick={onClose}
          >
            Change Video
          </Button>
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
              {data?.video?.description?.find(({ primary }) => primary)?.value}
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
          onClick={handleSelect}
          size="small"
        >
          Select
        </Button>
      </Stack>
      <VideoLanguage
        open={openLanguage}
        onClose={() => setOpenLanguage(false)}
        onChange={handleChange}
        language={selectedLanguage}
        languages={data?.video.variantLanguages}
        loading={loading}
      />
    </Stack>
  )
}

export default LocalDetails
