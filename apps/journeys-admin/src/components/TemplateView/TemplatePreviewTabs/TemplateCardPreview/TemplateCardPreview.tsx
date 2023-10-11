import 'swiper/swiper.min.css'

import Box from '@mui/material/Box'
import { Theme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { ReactElement } from 'react'
import SwiperCore, { A11y, Mousewheel } from 'swiper'
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

export function TemplateCardPreview({
  steps
}: TemplateCardPreviewProps): ReactElement {
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))

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
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          width: smUp ? 240 : 177,
          height: smUp ? 380 : 280
        }}
      >
        <Box
          sx={{
            transform: smUp ? 'scale(0.6)' : 'scale(0.4)',
            transformOrigin: smUp ? 'top left' : '22.5% top'
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              display: 'block',
              width: smUp ? 405 : 445,
              height: '100%',
              zIndex: 2,
              cursor: 'grab'
            }}
          />
          <FramePortal
            width={smUp ? 405 : 445}
            height={smUp ? 633 : 698}
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

  return (
    <Swiper
      freeMode
      slidesPerView="auto"
      spaceBetween={smUp ? 28 : 12}
      slidesOffsetAfter={smUp ? 40 : 70}
      mousewheel
      style={{
        marginLeft: smUp ? '-32px' : '-44px',
        marginRight: smUp ? '-36px' : '-44px',
        paddingLeft: smUp ? '32px' : '20px',
        zIndex: 2
      }}
    >
      {steps?.map((step) => (
        <SwiperSlide
          data-testid={'swiper-container'}
          key={step.id}
          style={{
            width: smUp ? '240px' : '177px',
            height: smUp ? '380px' : '280px',
            zIndex: 2
          }}
        >
          <TemplateCardPreviewItem step={step} />
        </SwiperSlide>
      ))}
    </Swiper>
  )
}
