import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded'
import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { ReactElement, useState } from 'react'
import SwiperCore, { Mousewheel, SwiperOptions } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'

import { TreeBlock } from '@core/journeys/ui/block'

import { GetJourney_journey_blocks_VideoBlock as VideoBlock } from '../../../../../__generated__/GetJourney'
import { VideoBlockSource } from '../../../../../__generated__/globalTypes'

interface TemplateVideoPreviewProps {
  videoBlocks: Array<TreeBlock<VideoBlock>>
}

SwiperCore.use([Mousewheel])

const DynamicTemplateVideoPlayer = dynamic<{
  id?: string | null
  source?: VideoBlockSource
  poster?: string
  startAt?: number
  endAt?: number
}>(
  async () =>
    await import(
      /* webpackChunkName: "TemplateVideoPlayer" */ './TemplateVideoPlayer'
    ).then((mod) => mod.TemplateVideoPlayer)
)

interface TemplateVideoPreviewItemProps {
  block?: TreeBlock<VideoBlock>
}

function TemplateVideoPreviewItem({
  block
}: TemplateVideoPreviewItemProps): ReactElement {
  const [hasPlayed, setHasPlayed] = useState(false)

  return (
    <>
      {hasPlayed ? (
        <DynamicTemplateVideoPlayer
          id={block?.video?.variant?.hls ?? block?.videoId}
          source={block?.source}
          poster={(block?.image as string) ?? block?.video?.image}
          startAt={block?.startAt ?? 0}
          endAt={block?.endAt ?? 10000}
        />
      ) : (
        <Box
          onClick={() => setHasPlayed(true)}
          sx={{
            position: 'relative',
            width: { xs: 280, sm: 430 },
            height: { xs: 157, sm: 239 },
            cursor: 'pointer',
            borderRadius: 4
          }}
        >
          <Image
            src={(block?.image as string) ?? block?.video?.image}
            alt={block?.video?.title[0]?.value ?? 'video' + ' image'}
            fill
            sizes="100vw"
            style={{
              objectFit: 'cover',
              borderRadius: '16px'
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '68px',
              height: '48px',
              marginLeft: '-34px',
              marginTop: '-24px'
            }}
          >
            <PlayArrowRounded
              sx={{
                width: '100%',
                height: '100%',
                color: 'background.default'
              }}
            />
          </Box>
        </Box>
      )}
    </>
  )
}

export function TemplateVideoPreview({
  videoBlocks
}: TemplateVideoPreviewProps): ReactElement {
  const { breakpoints } = useTheme()
  const swiperBreakpoints: SwiperOptions['breakpoints'] = {
    [breakpoints.values.xs]: {
      spaceBetween: 12
    },
    [breakpoints.values.sm]: {
      spaceBetween: 28
    }
  }

  return (
    <Swiper
      mousewheel={{
        forceToAxis: true
      }}
      freeMode
      watchOverflow
      spaceBetween={12}
      slidesPerView="auto"
      autoHeight
      observer
      observeParents
      breakpoints={swiperBreakpoints}
      style={{
        overflow: 'visible',
        zIndex: 2
      }}
    >
      {videoBlocks?.map((block) => (
        <SwiperSlide
          data-testid="TemplateVideosSwiperSlide"
          key={block.id}
          style={{ width: 'fit-content', zIndex: 2 }}
        >
          <TemplateVideoPreviewItem block={block} />
        </SwiperSlide>
      ))}
    </Swiper>
  )
}
