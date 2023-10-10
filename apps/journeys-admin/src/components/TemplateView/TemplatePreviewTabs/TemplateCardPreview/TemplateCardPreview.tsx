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

export function TemplateCardPreview({
  steps
}: TemplateCardPreviewProps): ReactElement {
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  return (
    <Swiper
      freeMode
      slidesPerView="auto"
      spaceBetween={24}
      slidesOffsetAfter={64}
      mousewheel
      style={{
        marginLeft: smUp ? '-32px' : '-24px',
        marginRight: smUp ? '-32px' : '-24px',
        paddingLeft: smUp ? '28px' : '20px',
        zIndex: 2
      }}
    >
      {steps?.map((step) => (
        <SwiperSlide
          key={step.id}
          style={{ width: smUp ? '240px' : '177px', zIndex: 2 }}
        >
          <TemplateCardPreviewItem step={step} />
        </SwiperSlide>
      ))}
    </Swiper>
  )
}

interface TemplateCardPreviewItemProps {
  step: TreeBlock<StepBlock>
}

export function TemplateCardPreviewItem({
  step
}: TemplateCardPreviewItemProps): ReactElement {
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  const { journey } = useJourney()
  const { rtl, locale } = getJourneyRTL(journey)
  const cardBlock = step.children.find(
    (child) => child.__typename === 'CardBlock'
  ) as TreeBlock<CardBlock>
  return (
    <FramePortal
      width={smUp ? '244px' : '181px'}
      height={smUp ? '384px' : '284px'}
      dir={rtl ? 'rtl' : 'ltr'}
      style={{ zIndex: -2, position: 'relative' }}
    >
      <ThemeProvider
        themeName={cardBlock?.themeName ?? ThemeName.base}
        themeMode={cardBlock?.themeMode ?? ThemeMode.dark}
        rtl={rtl}
        locale={locale}
      >
        <Box sx={{ p: 1, height: '100%', borderRadius: 4 }}>
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
  )
}
