import { BlockRenderer } from '../BlockRenderer'
import { ReactElement, useEffect, useState } from 'react'
import { TreeBlock } from '../../libs/transformer/transformer'
import { useBlocks } from '../../libs/client/cache/blocks'
import SwiperCore from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import { findIndex } from 'lodash'
import { JourneyProgress } from '../JourneyProgress'
import { Box, IconButton, useTheme } from '@mui/material'
import { useBreakpoints } from '@core/shared/ui'
import 'swiper/swiper.min.css'
import { ChevronLeft, ChevronRight } from '@mui/icons-material'

export interface ConductorProps {
  blocks: TreeBlock[]
}

const Conductor = ({ blocks }: ConductorProps): ReactElement => {
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

  const edgeSlideWidth = 16
  const getResponsiveGap = (
    minGapBetween = breakpoints.xs ? 16 : 44,
    maxSlideWidth = 854
  ): number =>
    Math.max(
      minGapBetween,
      (window.innerWidth - maxSlideWidth - edgeSlideWidth * 2) / 2
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
          onBeforeResize={() => setGapBetween(getResponsiveGap())}
          onBeforeTransitionStart={() => setGapBetween(getResponsiveGap())}
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
                  height: '100vh',
                  maxHeight: 'calc(100vh - 80px)',
                  [theme.breakpoints.up('lg')]: {
                    maxWidth: '854px',
                    maxHeight: '480px'
                  }
                }}
              >
                <BlockRenderer {...block} />
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
            <ChevronLeft
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
            <ChevronRight
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
