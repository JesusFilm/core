import { BlockRenderer } from '../BlockRenderer'
import { ReactElement, useEffect, useState } from 'react'
import { TreeBlock } from '../../libs/transformer/transformer'
import { useBlocks } from '../../libs/client/cache/blocks'
import type SwiperCore from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import { findIndex } from 'lodash'
import { JourneyProgress } from '../JourneyProgress'
import { Box, useTheme } from '@mui/material'
import { useBreakpoints } from '@core/shared/ui'
import 'swiper/swiper.min.css'

interface ConductorProps {
  blocks: TreeBlock[]
}

export function Conductor({ blocks }: ConductorProps): ReactElement {
  const { setTreeBlocks, nextActiveBlock, treeBlocks, activeBlock } =
    useBlocks()
  const [swiper, setSwiper] = useState<SwiperCore>()
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

  const previewSlideWidth = 16
  const responsiveGapBetween = (
    minGapBetween = breakpoints.md ? 44 : 16,
    maxSlideWidth = breakpoints.sm ? 660 : 854
  ): number =>
    Math.max(
      minGapBetween,
      (window.innerWidth - maxSlideWidth - previewSlideWidth * 2) / 2
    )

  const [gapBetweenSlides, setGapBetween] = useState(responsiveGapBetween())

  useEffect(() => {
    const updateWidth = (): void => {
      setGapBetween(responsiveGapBetween())
    }

    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [])

  return (
    <Box
      sx={{
        display: 'flex',
        // Fit to screen
        height: '80vh',
        flexDirection: 'column',
        [theme.breakpoints.up('lg')]: {
          flexDirection: 'column-reverse',
          height: 'auto'
        }
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignSelf: 'center',
          my: 6,
          width: '100%',
          px: `${16 + responsiveGapBetween(16, 854)}px`,
          [theme.breakpoints.only('sm')]: {
            px: `${16 + responsiveGapBetween(16, 660)}px`
          },
          [theme.breakpoints.only('md')]: {
            px: `${16 + responsiveGapBetween(44, 854)}px`
          }
        }}
      >
        <JourneyProgress />
      </Box>
      <Box sx={{ display: 'flex', height: 'auto', flexGrow: 1 }}>
        <Swiper
          // spaceBetween={16}
          slidesPerView={'auto'}
          centeredSlides={true}
          centeredSlidesBounds={true}
          autoHeight={true}
          // slidesOffsetBefore={24}
          // slidesOffsetAfter={32}
          onSwiper={(swiper) => setSwiper(swiper)}
          // onOrientationchange={(swiper) => {
          //   updateWidth()
          // }}
          allowTouchMove={false}
          updateOnWindowResize={true}
          watchOverflow={true}
          style={{
            paddingLeft: `${16 + responsiveGapBetween() / 2}px`,
            paddingRight: `${16 + responsiveGapBetween() / 2}px`
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
                  // justifyContent: 'center',
                  paddingTop: '4px',
                  paddingBottom: '4px',
                  px: `${responsiveGapBetween(16, 854) / 2}px`,
                  maxHeight: 'calc(100vh - 32px)',
                  [theme.breakpoints.only('sm')]: {
                    px: `${responsiveGapBetween(16, 660) / 2}px`,
                    maxWidth: '660px',
                    maxHeight: '280px'
                  },
                  [theme.breakpoints.only('md')]: {
                    px: `${responsiveGapBetween(44, 854) / 2}px`
                  },
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
          <Box
            data-testid="conductorPrevButton"
            sx={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              zIndex: 2,
              left: 0,
              background: (theme) => ({
                md: `linear-gradient(90deg, ${theme.palette.background.default}FF 0%, ${theme.palette.background.default}00 100%)`
              }),
              width: (theme) => theme.spacing(4)
            }}
          />
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
          <Box
            data-testid="conductorNextButton"
            onClick={handleNext}
            sx={{
              cursor:
                activeBlock?.locked === true || activeBlock?.nextBlockId == null
                  ? 'auto'
                  : 'pointer',
              display: 'block',
              position: 'absolute',
              top: 0,
              bottom: 0,
              zIndex: 2,
              right: 0,
              background: (theme) => ({
                md: `linear-gradient(90deg, ${theme.palette.background.default}00 0%, ${theme.palette.background.default}FF 100%)`
              }),
              width: (theme) => theme.spacing(4)
            }}
          />
        </Swiper>
      </Box>
    </Box>
  )
}

export default Conductor
