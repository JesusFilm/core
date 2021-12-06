import { Box } from '@mui/material'
import { GetJourneyForEdit_journey_blocks_StepBlock as StepBlock } from '../../../../__generated__/GetJourneyForEdit'
import { ReactElement, useEffect, useState } from 'react'
import { BlockRenderer, TreeBlock } from '@core/journeys/ui'
import { FramePortal } from '../../FramePortal'
import { ThemeProvider } from '@core/shared/ui'
import { ThemeName, ThemeMode } from '../../../../__generated__/globalTypes'
import SwiperCore from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/swiper.min.css'

export interface CanvasProps {
  onSelect?: (card: TreeBlock<StepBlock>) => void
  selected?: TreeBlock<StepBlock>
  steps: Array<TreeBlock<StepBlock>>
}

export function Canvas({
  steps,
  selected,
  onSelect
}: CanvasProps): ReactElement {
  const [swiper, setSwiper] = useState<SwiperCore>()

  useEffect(() => {
    if (swiper != null && selected != null) {
      swiper.slideTo(steps.findIndex(({ id }) => id === selected.id))
    }
  })

  return (
    <Box sx={{ backgroundColor: (theme) => theme.palette.background.paper }}>
      <Swiper
        centeredSlides={true}
        onSwiper={(swiper) => setSwiper(swiper)}
        slidesPerView="auto"
        onSlideChange={(swiper) => onSelect?.(steps[swiper.activeIndex])}
      >
        {steps.map((step) => (
          <SwiperSlide key={step.id} style={{ width: 'auto' }}>
            <Box
              data-testid={`step-${step.id}`}
              sx={{
                borderRadius: 4,
                transition: '0.2s border-color ease-out',
                position: 'relative',
                overflow: 'hidden',
                border: (theme) =>
                  selected?.id === step.id
                    ? `3px solid ${theme.palette.primary.main}`
                    : `3px solid ${theme.palette.background.default}`
              }}
              onClick={() => onSelect?.(step)}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  bottom: 0,
                  left: 0,
                  zIndex: 1,
                  transition: '0.2s background-color ease-out',
                  backgroundColor: (theme) =>
                    selected?.id === step.id
                      ? 'transparent'
                      : theme.palette.background.default
                }}
              />
              <FramePortal width={356} height={536}>
                <ThemeProvider
                  themeName={ThemeName.base}
                  themeMode={ThemeMode.light}
                >
                  <Box sx={{ p: 4, height: '100%' }}>
                    <BlockRenderer {...step} />
                  </Box>
                </ThemeProvider>
              </FramePortal>
            </Box>
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  )
}
