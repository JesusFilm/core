import { ReactElement, useEffect, useState } from 'react'
import SwiperCore from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import { findIndex } from 'lodash'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import { useTheme } from '@mui/material/styles'
import { useBreakpoints } from '@core/shared/ui'
import 'swiper/swiper.min.css'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { JourneyProgress } from '../JourneyProgress'
import { CardWrapper } from '../blocks/Card'

export interface ConductorProps {
  blocks: TreeBlock[]
}

const Conductor = ({ blocks }: ConductorProps): ReactElement => {
  const {
    setTreeBlocks,
    nextActiveBlock,
    treeBlocks,
    activeBlock,
    previousBlocks
  } = useBlocks()
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
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        [theme.breakpoints.up('lg')]: {
          height: '100%',
          flexDirection: 'column-reverse'
        }
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignSelf: 'center',
          py: 6,
          width: '100%',
          px: `${edgeSlideWidth + gapBetweenSlides}px`
        }}
      >
        <JourneyProgress />
      </Box>
      <Box sx={{ display: 'flex' }}>
        <Swiper
          slidesPerView={'auto'}
          centeredSlides={true}
          centeredSlidesBounds={true}
          onSwiper={(swiper) => setSwiper(swiper)}
          resizeObserver
          onBeforeResize={() => setGapBetween(getResponsiveGap())}
          onSlideChangeTransitionStart={() => setShowNavArrow(false)}
          onSlideChangeTransitionEnd={() => setShowNavArrow(true)}
          allowTouchMove={false}
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
                  display: 'flex',
                  paddingTop: '4px',
                  paddingBottom: '4px',
                  px: `${gapBetweenSlides / 2}px`,
                  height: 'calc(100vh - 80px)',
                  maxHeight: 'calc(100vh - 80px)',
                  [theme.breakpoints.only('sm')]: {
                    maxHeight: '460px'
                  },
                  [theme.breakpoints.up('lg')]: {
                    maxWidth: '854px',
                    maxHeight: '480px'
                  }
                }}
              >
                {activeBlock?.id === block.id ||
                previousBlocks[previousBlocks.length - 1]?.id === block.id ? (
                  <BlockRenderer {...block} />
                ) : (
                  <CardWrapper
                    id={block.id}
                    backgroundColor={theme.palette.primary.light}
                    themeMode={null}
                    themeName={null}
                  >
                    <></>
                  </CardWrapper>
                )}
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
    </Box>
  )
}

export default Conductor
