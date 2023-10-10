import Box from '@mui/material/Box'
import { ReactElement, useEffect, useRef, useState } from 'react'
import videojs from 'video.js'
import Player from 'video.js/dist/types/player'

import { VideoBlockSource } from '../../../../__generated__/globalTypes'

import 'videojs-youtube'
import 'video.js/dist/video-js.css'

interface TemplateVideoPreviewProps {
  id?: string | null
  source?: VideoBlockSource
  poster?: string
}

export function TemplateVideoPreview({
  id,
  source,
  poster
}: TemplateVideoPreviewProps): ReactElement {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [player, setPlayer] = useState<Player>()

  useEffect(() => {
    if (videoRef.current != null) {
      setPlayer(
        videojs(videoRef.current, {
          controls: true,
          bigPlayButton: true,
          fluid: true,
          poster,
          // Make video fill container instead of set aspect ratio
          fill: true,
          userActions: {
            hotkeys: true,
            doubleClick: true
          },
          responsive: true
        })
      )
    }
  }, [poster])

  useEffect(() => {
    // make sure swiper-js is not interrupting interaction with certain components of video-js
    player
      ?.getChild('ControlBar')
      ?.getChild('ProgressControl')
      ?.addClass('swiper-no-swiping')

    player
      ?.getChild('ControlBar')
      ?.getChild('VolumePanel')
      ?.addClass('swiper-no-swiping')
  }, [player])

  return (
    <Box
      sx={{
        width: '430px',
        height: '239px',
        overflow: 'hidden',
        borderRadius: 4,
        position: 'relative'
      }}
    >
      <video
        ref={videoRef}
        className="video-js vjs-tech"
        playsInline
        style={{ height: '100%' }}
      >
        {source === VideoBlockSource.cloudflare && id != null && (
          <source
            src={`https://customer-${
              process.env.NEXT_PUBLIC_CLOUDFLARE_STREAM_CUSTOMER_CODE ?? ''
            }.cloudflarestream.com/${id ?? ''}/manifest/video.m3u8`}
            type="application/x-mpegURL"
          />
        )}
        {source === VideoBlockSource.internal && id != null && (
          <source src={id} type="application/x-mpegURL" />
        )}
        {source === VideoBlockSource.youTube && id != null && (
          <source
            src={`https://www.youtube.com/embed/${id}`}
            type="video/youtube"
          />
        )}
      </video>
    </Box>
  )
}
