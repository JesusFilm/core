import 'swiper/swiper.min.css'

import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'
import { ReactElement } from 'react'
import SwiperCore, { A11y, Mousewheel, SwiperOptions } from 'swiper'
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

SwiperCore.use([Mousewheel, A11y])

interface TemplateCardPreviewProps {
  steps?: Array<TreeBlock<StepBlock>>
}

interface TemplateCardPreviewItemProps {
  step: TreeBlock<StepBlock>
}

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
        width: { sm: 240, xs: 177 },
        height: { sm: 380, xs: 280 }
      }}
    >
      <Box
        sx={{
          transform: { sm: 'scale(0.6)', xs: 'scale(0.4)' },
          transformOrigin: 'top left'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            display: 'block',
            width: { sm: 405, xs: 445 },
            height: { sm: 633, xs: 698 },
            zIndex: 2,
            cursor: 'grab'
          }}
        />
        <FramePortal
          sx={{
            width: { sm: 405, xs: 445 },
            height: { sm: 633, xs: 698 }
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
    [breakpoints.values.sm]: {
      spaceBetween: 28
    }
  }

  return (
    <Swiper
      freeMode
      watchOverflow
      slidesPerView="auto"
      spaceBetween={12}
      breakpoints={swiperBreakpoints}
      mousewheel
      autoHeight
      style={{
        overflow: 'visible',
        zIndex: 2
      }}
    >
      {steps?.map((step) => (
        <SwiperSlide
          data-testid="templateCardsSwiperSlide"
          key={step.id}
          style={{
            width: 'fit-content',
            zIndex: 2
          }}
        >
          <TemplateCardPreviewItem step={step} />
        </SwiperSlide>
      ))}
    </Swiper>
  )
}
