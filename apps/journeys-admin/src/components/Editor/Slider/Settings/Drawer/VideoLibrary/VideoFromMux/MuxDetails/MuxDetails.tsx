import { gql, useLazyQuery } from '@apollo/client'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Box from '@mui/system/Box'
import { ReactElement, useEffect, useRef } from 'react'
import videojs from 'video.js'
import Player from 'video.js/dist/types/player'

import { defaultVideoJsOptions } from '@core/shared/ui/defaultVideoJsOptions'

import { GetMuxVideo } from '../../../../../../../../../__generated__/GetMuxVideo'
import type { VideoDetailsProps } from '../../VideoDetails/VideoDetails'

import 'video.js/dist/video-js.css'

const GET_MUX_VIDEO = gql`
  query GetMuxVideo($id: ID!) {
    getMuxVideo(id: $id) {
      id
      playbackId
      readyToStream
    }
  }
`

export function MuxDetails({
  open,
  id
}: Pick<VideoDetailsProps, 'open' | 'id' | 'onSelect'>): ReactElement {
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<Player>()
  const [loadVideo, { data, loading }] = useLazyQuery<GetMuxVideo>(
    GET_MUX_VIDEO,
    {
      variables: { id }
    }
  )

  useEffect(() => {
    if (videoRef.current != null && data?.getMuxVideo != null) {
      playerRef.current = videojs(videoRef.current, {
        ...defaultVideoJsOptions,
        fluid: true,
        controls: true,
        poster: `https://image.mux.com/${data.getMuxVideo.playbackId}/thumbnail.png?time=1`
      })
      playerRef.current.src({
        type: 'application/x-mpegURL',
        src: `https://stream.mux.com/${data.getMuxVideo.playbackId}.m3u8`
      })
    }
  }, [data, id])

  useEffect(() => {
    if (open) {
      void loadVideo()
    }
  }, [open, loadVideo])

  return (
    <Stack spacing={4} sx={{ p: 6 }} data-testid="MuxDetails">
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
          />
        </Box>
      )}
    </Stack>
  )
}
