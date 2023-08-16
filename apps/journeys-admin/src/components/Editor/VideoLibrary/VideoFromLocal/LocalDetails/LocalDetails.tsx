import { gql, useLazyQuery } from '@apollo/client'
import ArrowDropDown from '@mui/icons-material/ArrowDropDown'
import Check from '@mui/icons-material/Check'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Box from '@mui/system/Box'
import { ReactElement, useEffect, useRef, useState } from 'react'
import videojs from 'video.js'
import Player from 'video.js/dist/types/player'

import { useEditor } from '@core/journeys/ui/EditorProvider'
import { LanguageOption } from '@core/shared/ui/LanguageAutocomplete'

import { GetJourney_journey_blocks_VideoBlock as VideoBlock } from '../../../../../../__generated__/GetJourney'
import { GetVideo } from '../../../../../../__generated__/GetVideo'
import { VideoBlockSource } from '../../../../../../__generated__/globalTypes'
import { VideoDescription } from '../../VideoDescription'
import type { VideoDetailsProps } from '../../VideoDetails/VideoDetails'
import { VideoLanguage } from '../../VideoLanguage'

import 'video.js/dist/video-js.css'

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
      variant(languageId: $languageId) {
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
  onSelect
}: Pick<VideoDetailsProps, 'open' | 'id' | 'onSelect'>): ReactElement {
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<Player>()
  const [playing, setPlaying] = useState(false)
  const {
    state: { selectedBlock }
  } = useEditor()

  const videoBlock = selectedBlock as VideoBlock

  const [openLanguage, setOpenLanguage] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption>({
    id: '529',
    localName: undefined,
    nativeName: 'English'
  })

  const [loadVideo, { data, loading }] = useLazyQuery<GetVideo>(GET_VIDEO, {
    variables: { id, languageId: '529' }
  })

  const handleChange = (selectedLanguage: LanguageOption): void => {
    setSelectedLanguage(selectedLanguage)
  }

  const handleSelect = (): void => {
    onSelect({
      videoId: id,
      videoVariantLanguageId: selectedLanguage?.id,
      duration: time,
      source: VideoBlockSource.internal,
      startAt: videoBlock?.videoId === id ? videoBlock?.startAt : 0,
      endAt: videoBlock?.videoId === id ? videoBlock?.endAt : time
    })
  }

  const time = data?.video?.variant?.duration ?? 0
  const duration =
    time < 3600
      ? new Date(time * 1000).toISOString().substring(14, 19)
      : new Date(time * 1000).toISOString().substring(11, 19)

  const videoDescription =
    data?.video?.description?.find(({ primary }) => primary)?.value ?? ''

  useEffect(() => {
    if (videoRef.current != null && data != null) {
      playerRef.current = videojs(videoRef.current, {
        fluid: true,
        controls: true,
        poster: data.video?.image ?? undefined
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
                src={data?.video?.variant?.hls ?? ''}
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
            <Box sx={{ display: 'inline', position: 'relative' }} />
            <VideoDescription videoDescription={videoDescription} />
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
          sx={{ backgroundColor: 'secondary.dark' }}
        >
          Select
        </Button>
      </Stack>
      <VideoLanguage
        open={openLanguage}
        onClose={() => setOpenLanguage(false)}
        onChange={handleChange}
        language={selectedLanguage}
        languages={data?.video?.variantLanguages}
        loading={loading}
      />
    </Stack>
  )
}

export default LocalDetails
