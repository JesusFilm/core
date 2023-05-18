import videojs from 'video.js'
import { ReactElement, useEffect, useRef } from 'react'
import Box from '@mui/system/Box'
import Stack from '@mui/material/Stack'
import 'video.js/dist/video-js.css'
import type { VideoDetailsProps } from '../../VideoDetails/VideoDetails'

export function CloudflareDetails({
  open,
  id,
  onSelect
}: Pick<VideoDetailsProps, 'open' | 'id' | 'onSelect'>): ReactElement {
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<videojs.Player>()

  useEffect(() => {
    if (videoRef.current != null && id != null) {
      playerRef.current = videojs(videoRef.current, {
        fluid: true,
        controls: true,
        poster: `https://customer-${
          process.env.NEXT_PUBLIC_CLOUDFLARE_STREAM_CUSTOMER_CODE ??
          '209o3ptmsiaetvfx'
        }.cloudflarestream.com/${id ?? ''}/thumbnails/thumbnail.jpg?time=2s`
      })
    }
  }, [id])

  return (
    <Stack spacing={4} sx={{ p: 6 }}>
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
              src={`https://customer-${
                process.env.NEXT_PUBLIC_CLOUDFLARE_STREAM_CUSTOMER_CODE ??
                '209o3ptmsiaetvfx'
              }.cloudflarestream.com/${id ?? ''}/manifest/video.m3u8`}
              type="application/x-mpegURL"
            />
          </video>
        </Box>
      </>
    </Stack>
  )
}
