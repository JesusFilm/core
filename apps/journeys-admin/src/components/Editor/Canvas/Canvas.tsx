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
  const [spaceBetween, setSpaceBetween] = useState(16)

  useEffect(() => {
    if (swiper != null && selected != null) {
      swiper.slideTo(steps.findIndex(({ id }) => id === selected.id))
    }
  }, [steps, swiper, selected])

  useEffect(() => {
    const setSpaceBetweenOnResize = (): void => {
      const EDGE_SLIDE_WIDTH = 24
      const MIN_SPACE_BETWEEN = 16
      const spaceBetween = Math.max(
        MIN_SPACE_BETWEEN,
        (window.innerWidth - 362 - EDGE_SLIDE_WIDTH * 2) / 2
      )
      setSpaceBetween(spaceBetween)
    }

    // Set initial windowWidth
    setSpaceBetweenOnResize()

    window.addEventListener('resize', setSpaceBetweenOnResize)
    return () => window.removeEventListener('resize', setSpaceBetweenOnResize)
  }, [])

  return (
    <Box
      sx={{
        backgroundColor: (theme) => theme.palette.background.paper,
        paddingY: 9,
        '& .swiper-container': {
          paddingX: 6
        },
        '& .swiper-slide': {
          display: 'flex',
          justifyContent: 'center'
        }
      }}
    >
      <Swiper
        slidesPerView={'auto'}
        spaceBetween={spaceBetween}
        centeredSlides={true}
        onSwiper={(swiper) => setSwiper(swiper)}
        onSlideChange={(swiper) => onSelect?.(steps[swiper.activeIndex])}
      >
        {steps.map((step) => (
          <SwiperSlide key={step.id} style={{ width: 362 }}>
            <Box
              data-testid={`step-${step.id}`}
              sx={{
                borderRadius: 5,
                transition: '0.2s all ease-out 0.1s',
                position: 'relative',
                overflow: 'hidden',
                border: (theme) =>
                  step.id === selected?.id
                    ? `3px solid ${theme.palette.primary.main}`
                    : `3px solid ${theme.palette.background.default}`,
                transform:
                  step.id === selected?.id ? 'scaleY(1)' : 'scaleY(0.9)',
                height: 536
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
                  transition: '0.2s opacity ease-out 0.1s',
                  backgroundColor: (theme) => theme.palette.background.default,
                  opacity: step.id === selected?.id ? 0 : 1
                }}
              />
              <FramePortal width={356} height={536}>
                <ThemeProvider
                  themeName={ThemeName.base}
                  themeMode={ThemeMode.light}
                >
                  <Box sx={{ p: 1, height: '100%' }}>
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
