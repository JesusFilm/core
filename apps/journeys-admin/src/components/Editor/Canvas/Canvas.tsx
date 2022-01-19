import Box from '@mui/material/Box'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Theme } from '@mui/material/styles'
import { ReactElement, useContext, useEffect, useState } from 'react'
import { BlockRenderer, EditorContext } from '@core/journeys/ui'
import { ThemeProvider } from '@core/shared/ui'
import SwiperCore from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import { ThemeName, ThemeMode } from '../../../../__generated__/globalTypes'
import { FramePortal } from '../../FramePortal'
import { DRAWER_WIDTH } from '../Drawer'
import 'swiper/swiper.min.css'

const EDGE_SLIDE_WIDTH = 24
const MIN_SPACE_BETWEEN = 16

export function Canvas(): ReactElement {
  const [swiper, setSwiper] = useState<SwiperCore>()
  const [spaceBetween, setSpaceBetween] = useState(16)
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  const {
    state: { steps, selectedStep, selectedBlock },
    dispatch
  } = useContext(EditorContext)

  useEffect(() => {
    if (swiper != null && selectedStep != null) {
      swiper.slideTo(steps.findIndex(({ id }) => id === selectedStep.id))
    }
  }, [steps, swiper, selectedStep])

  useEffect(() => {
    const setSpaceBetweenOnResize = (): void => {
      const spaceBetween = Math.max(
        MIN_SPACE_BETWEEN,
        (window.innerWidth -
          Number(smUp) * DRAWER_WIDTH -
          362 -
          EDGE_SLIDE_WIDTH * 2) /
          2
      )

      setSpaceBetween(spaceBetween)
    }

    // Set initial windowWidth
    setSpaceBetweenOnResize()

    window.addEventListener('resize', setSpaceBetweenOnResize)
    return () => window.removeEventListener('resize', setSpaceBetweenOnResize)
  }, [smUp])

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
      onClick={() => {
        dispatch({
          type: 'SetSelectedBlockAction',
          block: selectedStep
        })
      }}
    >
      <Swiper
        slidesPerView={'auto'}
        spaceBetween={spaceBetween}
        centeredSlides={true}
        shortSwipes={false}
        slideToClickedSlide
        onSwiper={(swiper) => setSwiper(swiper)}
        onSlideChange={(swiper) =>
          dispatch({
            type: 'SetSelectedStepAction',
            step: steps[swiper.activeIndex]
          })
        }
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
                  step.id === selectedBlock?.id
                    ? `2px solid ${theme.palette.primary.main}`
                    : `2px solid ${theme.palette.background.default}`,
                transform:
                  step.id === selectedStep?.id ? 'scaleY(1)' : 'scaleY(0.9)',
                height: 536
              }}
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
                  opacity: step.id === selectedStep?.id ? 0 : 1,
                  pointerEvents: step.id === selectedStep?.id ? 'none' : 'auto'
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
