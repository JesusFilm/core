import 'swiper/swiper.min.css'

import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import { useTheme } from '@mui/material/styles'
import { ReactElement } from 'react'
import SwiperCore, { Mousewheel, SwiperOptions } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'

import { TreeBlock } from '@core/journeys/ui/block'
import { BlockRenderer } from '@core/journeys/ui/BlockRenderer'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { getJourneyRTL } from '@core/journeys/ui/rtl'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'

import {
  GetJourney_journey_blocks_CardBlock as CardBlock,
  GetJourney_journey_blocks_StepBlock as StepBlock
} from '../../../../../__generated__/GetJourney'
import { ThemeMode, ThemeName } from '../../../../../__generated__/globalTypes'
import { CardWrapper } from '../../../CardPreview/CardList/CardWrapper'
import { VideoWrapper } from '../../../Editor/Canvas/VideoWrapper'
import { FramePortal } from '../../../FramePortal'

interface TemplateCardPreviewProps {
  steps?: Array<TreeBlock<StepBlock>>
}

interface TemplateCardPreviewItemProps {
  step: TreeBlock<StepBlock>
}

SwiperCore.use([Mousewheel])

function TemplateCardPreviewItem({
  step
}: TemplateCardPreviewItemProps): ReactElement {
  const { journey } = useJourney()
  const { rtl, locale } = getJourneyRTL(journey)
  const cardBlock = step.children.find(
    (child) => child.__typename === 'CardBlock'
  ) as TreeBlock<CardBlock>

  return (
    <Box
      sx={{
        position: 'relative',
        width: { xs: 193, sm: 267 },
        height: { xs: 300, sm: 420 }
      }}
      data-testid="TemplateCardPreviewItem"
    >
      <Box
        sx={{
          transform: { xs: 'scale(0.4)', sm: 'scale(0.6)' },
          transformOrigin: 'top left'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            display: 'block',
            width: { xs: 485, sm: 445 },
            height: { xs: 738, sm: 673 },
            zIndex: 2,
            cursor: 'grab'
          }}
        />
        <FramePortal
          sx={{
            width: { xs: 485, sm: 445 },
            height: { xs: 738, sm: 673 }
          }}
          dir={rtl ? 'rtl' : 'ltr'}
        >
          <ThemeProvider
            themeName={cardBlock?.themeName ?? ThemeName.base}
            themeMode={cardBlock?.themeMode ?? ThemeMode.dark}
            rtl={rtl}
            locale={locale}
          >
            <Box
              sx={{
                height: '100%',
                borderRadius: 4
              }}
            >
              <BlockRenderer
                block={step}
                wrappers={{
                  VideoWrapper,
                  CardWrapper
                }}
              />
            </Box>
          </ThemeProvider>
        </FramePortal>
      </Box>
    </Box>
  )
}

export function TemplateCardPreview({
  steps
}: TemplateCardPreviewProps): ReactElement {
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
      slidesPerView="auto"
      spaceBetween={12}
      observer
      observeParents
      breakpoints={swiperBreakpoints}
      autoHeight
      style={{
        overflow: 'visible',
        zIndex: 2
      }}
    >
      {steps != null
        ? steps.map((step) => {
            return (
              <SwiperSlide
                data-testid="TemplateCardsSwiperSlide"
                key={step.id}
                style={{
                  width: 'fit-content',
                  zIndex: 2
                }}
              >
                <TemplateCardPreviewItem step={step} />
              </SwiperSlide>
            )
          })
        : [0, 1, 2, 3, 4, 5, 6].map((value) => {
            return (
              <SwiperSlide
                data-testid="TemplateCardsSwiperSlide"
                key={value}
                style={{
                  width: 'fit-content',
                  zIndex: 2
                }}
              >
                <Skeleton
                  data-testid="TemplateCardSkeleton"
                  sx={{
                    width: { xs: 217, sm: 280 },
                    height: { xs: 300, sm: 420 },
                    transform: 'scale(1)',
                    borderRadius: 2
                  }}
                />
              </SwiperSlide>
            )
          })}
    </Swiper>
  )
}
