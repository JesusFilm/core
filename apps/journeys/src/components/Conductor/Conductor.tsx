import { ReactElement, useEffect, useState } from 'react'
import SwiperCore from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import { findIndex } from 'lodash'
import Box from '@mui/material/Box'
import Fade from '@mui/material/Fade'
import Stack from '@mui/material/Stack'
import IconButton from '@mui/material/IconButton'
import { useTheme } from '@mui/material/styles'
import { useBreakpoints } from '@core/shared/ui'
import 'swiper/swiper.min.css'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import {
  BlockRenderer,
  CardWrapper,
  TreeBlock,
  useBlocks
} from '@core/journeys/ui'
import Div100vh from 'react-div-100vh'
import { JourneyProgress } from '../JourneyProgress'

export interface ConductorProps {
  blocks: TreeBlock[]
}

export function Conductor({ blocks }: ConductorProps): ReactElement {
  const { setTreeBlocks, nextActiveBlock, treeBlocks, activeBlock } =
    useBlocks()
  const [swiper, setSwiper] = useState<SwiperCore>()
  const [showNavArrows, setShowNavArrow] = useState(true)
  const breakpoints = useBreakpoints()
  const theme = useTheme()

  useEffect(() => {
    setTreeBlocks(blocks)
  }, [setTreeBlocks, blocks])

  useEffect(() => {
    if (swiper != null && activeBlock != null && treeBlocks != null) {
      const index = findIndex(
        treeBlocks,
        (treeBlock) => treeBlock.id === activeBlock.id
      )
      if (index > -1 && swiper.activeIndex !== index) {
        swiper.slideTo(index)
      }
    }
  }, [swiper, activeBlock, treeBlocks])

  function handleNext(): void {
    if (activeBlock != null && !activeBlock.locked) nextActiveBlock()
  }

  const handleSlideChange = (): void => {
    if (swiper != null && treeBlocks != null) {
      const index = swiper.activeIndex
      if (index > -1 && index < treeBlocks.length) {
        nextActiveBlock({ id: treeBlocks[index].id })
      }
    }
  }

  const [windowWidth, setWindowWidth] = useState(theme.breakpoints.values.xl)

  useEffect(() => {
    const updateWidth = (): void => {
      setWindowWidth(window.innerWidth)
    }

    // Set initial windowWidth
    setWindowWidth(window.innerWidth)

    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [])

  const edgeSlideWidth = 16
  const getResponsiveGap = (
    minGapBetween = breakpoints.sm ? 44 : 16,
    maxSlideWidth = 854
  ): number =>
    Math.max(
      minGapBetween,
      (windowWidth - maxSlideWidth - edgeSlideWidth * 2) / 2
    )

  const [gapBetweenSlides, setGapBetween] = useState(getResponsiveGap())

  return (
    <Div100vh>
      <Stack
        direction={breakpoints.lg ? 'column-reverse' : 'column'}
        sx={{
          justifyContent: 'center',
          height: '100%'
        }}
      >
        <Box
          sx={{
            px: `${edgeSlideWidth + gapBetweenSlides}px`,
            py: 6,
            pt: { lg: 0 }
          }}
        >
          <JourneyProgress />
        </Box>
        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            [theme.breakpoints.only('sm')]: {
              maxHeight: '460px'
            },
            [theme.breakpoints.up('lg')]: {
              maxHeight: '480px'
            }
          }}
        >
          <Swiper
            slidesPerView={'auto'}
            centeredSlides={true}
            centeredSlidesBounds={true}
            onSwiper={(swiper) => setSwiper(swiper)}
            resizeObserver
            onBeforeResize={() => setGapBetween(getResponsiveGap())}
            onSlideChangeTransitionStart={() => setShowNavArrow(false)}
            onSlideChangeTransitionEnd={() => setShowNavArrow(true)}
            allowSlidePrev={false}
            allowSlideNext={true}
            onSlideChange={handleSlideChange}
            style={{
              width: '100%',
              paddingLeft: `${edgeSlideWidth + gapBetweenSlides / 2}px`,
              paddingRight: `${edgeSlideWidth + gapBetweenSlides / 2}px`
            }}
          >
            {treeBlocks.map((block) => (
              <SwiperSlide
                key={block.id}
                style={{
                  marginRight: '0px'
                }}
              >
                <Box
                  sx={{
                    display: 'grid',
                    px: `${gapBetweenSlides / 2}px`,
                    height: `calc(100% - ${theme.spacing(6)})`,
                    [theme.breakpoints.up('lg')]: {
                      maxWidth: '854px'
                    }
                  }}
                >
                  <CardWrapper
                    id={block.id}
                    backgroundColor={theme.palette.primary.light}
                    themeMode={null}
                    themeName={null}
                    sx={{ gridColumn: 1, gridRow: 1, boxShadow: 'none' }}
                  >
                    <></>
                  </CardWrapper>
                  <Fade
                    in={activeBlock?.id === block.id}
                    mountOnEnter
                    unmountOnExit
                  >
                    <Box
                      sx={{
                        width: '100%',
                        height: '100%',
                        gridColumn: 1,
                        gridRow: 1
                      }}
                    >
                      <BlockRenderer block={block} />
                    </Box>
                  </Fade>
                </Box>
              </SwiperSlide>
            ))}
            <IconButton
              data-testid="conductorPrevButton"
              onClick={handleNext}
              disabled={true}
              disableRipple
              sx={{
                display: showNavArrows ? 'flex' : 'none',
                position: 'absolute',
                top: 0,
                bottom: 0,
                zIndex: 2,
                left: 0,
                width: `${2 * edgeSlideWidth + gapBetweenSlides}px`,
                pl: ` ${gapBetweenSlides - 100}px`,
                color: (theme) => theme.palette.text.primary
              }}
            >
              <ChevronLeftIcon
                fontSize={'large'}
                sx={{
                  display: 'none',
                  [theme.breakpoints.only('xl')]: {
                    display: 'block'
                  }
                }}
              />
            </IconButton>
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                zIndex: 2,
                right: 0,
                background: (theme) => theme.palette.background.default,
                transition: 'opacity 0.5s ease-out',
                opacity: activeBlock?.nextBlockId != null ? 0 : 1,
                width: (theme) => theme.spacing(4)
              }}
            />
            <IconButton
              data-testid="conductorNextButton"
              onClick={handleNext}
              disabled={
                activeBlock?.locked === true || activeBlock?.nextBlockId == null
              }
              disableRipple
              sx={{
                display: showNavArrows ? 'flex' : 'none',
                position: 'absolute',
                top: 0,
                bottom: 0,
                zIndex: 2,
                right: 0,
                width: `${2 * edgeSlideWidth + gapBetweenSlides}px`,
                pr: ` ${gapBetweenSlides - 100}px`,
                color: (theme) => theme.palette.text.primary
              }}
            >
              <ChevronRightIcon
                fontSize={'large'}
                sx={{
                  display: 'none',
                  [theme.breakpoints.only('xl')]: {
                    display: 'block'
                  }
                }}
              />
            </IconButton>
          </Swiper>
        </Box>
      </Stack>
    </Div100vh>
  )
}
