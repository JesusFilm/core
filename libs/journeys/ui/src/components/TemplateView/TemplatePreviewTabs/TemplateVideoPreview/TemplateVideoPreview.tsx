import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded'
import Box from '@mui/material/Box'
import { styled, useTheme } from '@mui/material/styles'
import get from 'lodash/get'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { ReactElement, useState } from 'react'
import { A11y, FreeMode, Mousewheel } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import { SwiperOptions } from 'swiper/types'

import { TreeBlock } from '../../../../libs/block'
import { GetJourney_journey_blocks_VideoBlock as VideoBlock } from '../../../../libs/useJourneyQuery/__generated__/GetJourney'

import { TemplateVideoPlayerProps } from './TemplateVideoPlayer/TemplateVideoPlayer'

interface TemplateVideoPreviewProps {
  videoBlocks: Array<TreeBlock<VideoBlock>>
}

const DynamicTemplateVideoPlayer = dynamic<TemplateVideoPlayerProps>(
  async () =>
    await import(
      /* webpackChunkName: "TemplateVideoPlayer" */ './TemplateVideoPlayer'
    ).then((mod) => mod.TemplateVideoPlayer)
)

interface TemplateVideoPreviewItemProps {
  block?: TreeBlock<VideoBlock>
}

const StyledSwiperSlide = styled(SwiperSlide)(() => ({}))

function TemplateVideoPreviewItem({
  block
}: TemplateVideoPreviewItemProps): ReactElement {
  const [hasPlayed, setHasPlayed] = useState(false)
  const [opacity, setOpacity] = useState(1)

  return (
    <Box
      onClick={() => setHasPlayed(true)}
      sx={{
        position: 'relative',
        width: { xs: 280, sm: 430 },
        height: { xs: 157, sm: 239 },
        cursor: 'pointer',
        borderRadius: 4,
        overflow: 'hidden'
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 2,
          backgroundColor: 'divider',
          transition: (theme) => theme.transitions.create('opacity'),
          opacity
        }}
      />
      {hasPlayed ? (
        <DynamicTemplateVideoPlayer
          id={
            block?.mediaVideo?.__typename == 'Video'
              ? block?.mediaVideo?.variant?.hls
              : get(block, 'mediaVideo.id')
          }
          source={block?.source}
          poster={
            block?.mediaVideo?.__typename != 'Video'
              ? (block?.image as string)
              : (block?.mediaVideo?.images[0]?.mobileCinematicHigh as string)
          }
          startAt={block?.startAt ?? 0}
          endAt={block?.endAt ?? 10000}
          mediaVideo={block?.mediaVideo}
        />
      ) : (
        <Image
          src={
            block?.mediaVideo?.__typename != 'Video'
              ? (block?.image as string)
              : (block?.mediaVideo?.images[0]?.mobileCinematicHigh as string)
          }
          alt={
            block?.mediaVideo?.__typename == 'Video'
              ? block?.mediaVideo?.title[0]?.value
              : 'video image'
          }
          fill
          sizes="100vw"
          onLoad={() => setOpacity(0)}
          style={{
            objectFit: 'cover',
            borderRadius: '16px',
            color: 'red'
          }}
        />
      )}
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
      modules={[Mousewheel, FreeMode, A11y]}
      mousewheel={{
        forceToAxis: true
      }}
      freeMode
      watchOverflow
      spaceBetween={12}
      slidesPerView="auto"
      observer
      observeParents
      breakpoints={swiperBreakpoints}
      style={{
        overflow: 'visible',
        zIndex: 2
      }}
    >
      {videoBlocks?.map((block) => {
        return (
          <StyledSwiperSlide
            data-testid="TemplateVideosSwiperSlide"
            key={block.id}
            sx={{ width: 'unset !important', zIndex: 2, mr: { xs: 3, sm: 7 } }}
          >
            <TemplateVideoPreviewItem block={block} />
          </StyledSwiperSlide>
        )
      })}
    </Swiper>
  )
}
