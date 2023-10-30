import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'
import { ReactElement, useEffect, useRef, useState } from 'react'
import { SwiperOptions } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import videojs from 'video.js'
import Player from 'video.js/dist/types/player'

import { TreeBlock } from '@core/journeys/ui/block'

import { GetJourney_journey_blocks_VideoBlock as VideoBlock } from '../../../../../__generated__/GetJourney'
import { VideoBlockSource } from '../../../../../__generated__/globalTypes'

interface TemplateVideoPreviewProps {
  videoBlocks: Array<TreeBlock<VideoBlock>>
}

interface TemplateVideoPreviewItemProps {
  id?: string | null
  source?: VideoBlockSource
  poster?: string
}

function TemplateVideoPreviewItem({
  id,
  source,
  poster
}: TemplateVideoPreviewItemProps): ReactElement {
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
        position: 'relative',
        backgroundColor: 'red'
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
            }.cloudflarestream.com/${id}/manifest/video.m3u8`}
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

export function TemplateVideoPreview({
  videoBlocks
}: TemplateVideoPreviewProps): ReactElement {
  const { breakpoints } = useTheme()
  const swiperBreakpoints: SwiperOptions['breakpoints'] = {
    [breakpoints.values.sm]: {
      spaceBetween: 28
    }
  }
  return (
    <Swiper
      freeMode
      watchOverflow
      spaceBetween={12}
      slidesPerView="auto"
      breakpoints={swiperBreakpoints}
      style={{
        overflow: 'visible',
        zIndex: 2
      }}
    >
      {videoBlocks?.map((block) => (
        <SwiperSlide key={block.id} style={{ width: 'fit-content', zIndex: 2 }}>
          <TemplateVideoPreviewItem
            id={block.video?.variant?.hls ?? block.videoId}
            source={block.source}
            poster={(block.image as string) ?? block.video?.image}
          />
        </SwiperSlide>
      ))}
    </Swiper>
  )
}
