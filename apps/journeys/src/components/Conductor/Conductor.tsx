import { BlockRenderer } from '../BlockRenderer'
import { ReactElement, useEffect, useState } from 'react'
import { TreeBlock } from '../../libs/transformer/transformer'
import { useBlocks } from '../../libs/client/cache/blocks'
import type SwiperCore from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import { findIndex } from 'lodash'
import { JourneyProgress } from '../JourneyProgress'
import { Box, Container, useTheme } from '@mui/material'
import 'swiper/swiper.min.css'
import { useBreakpoints } from '@core/shared/ui'

interface ConductorProps {
  blocks: TreeBlock[]
}

export function Conductor({ blocks }: ConductorProps): ReactElement {
  const { setTreeBlocks, nextActiveBlock, treeBlocks, activeBlock } =
    useBlocks()
  const [swiper, setSwiper] = useState<SwiperCore>()
  const [windowWidth, setWidth] = useState(window.innerWidth)
  const theme = useTheme()
  const breakpoints = useBreakpoints()

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

  useEffect(() => {
    const updateWidth = (): void => {
      setWidth(window.innerWidth)
    }

    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [])

  return (
    <Container
      disableGutters
      sx={{
        display: 'flex',
        // Fit to screen
        height: '80vh',
        m: 0,
        flexDirection: 'column',
        [theme.breakpoints.up('xs')]: {
          maxWidth: '100vw'
        },
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
          width: 'calc(100% - 20px - 20px)'
        }}
      >
        <JourneyProgress />
      </Box>
      <Box sx={{ display: 'flex', height: 'auto', flexGrow: 1 }}>
        <Swiper
          spaceBetween={16}
          slidesPerView="auto"
          centeredSlides={true}
          onSwiper={(swiper) => setSwiper(swiper)}
          allowTouchMove={false}
          // autoHeight={true}
          breakpoints={{
            // variable spaceBetween on landscape
            '@1.25': {
              spaceBetween:
                (windowWidth - Math.min(660, windowWidth - 64) - 32) / 2
            },
            600: {
              spaceBetween: 44
            },
            961: {
              spaceBetween: (windowWidth - 854 - 32) / 2
            }
          }}
        >
          {treeBlocks.map((block) => (
            <SwiperSlide
              key={block.id}
              style={{
                display: 'flex',
                justifyContent: 'center',
                paddingTop: '4px',
                paddingBottom: '4px',
                width: `calc(100% - ${breakpoints.md ? 60 : 32}px - ${
                  breakpoints.md ? 60 : 32
                }px)`,
                maxWidth: breakpoints.sm
                  ? '660px'
                  : breakpoints.lg || breakpoints.xl
                  ? '854px'
                  : undefined,
                minWidth: breakpoints.sm
                  ? '504px'
                  : breakpoints.lg || breakpoints.xl
                  ? '854px'
                  : undefined,
                height: 'auto',
                maxHeight: breakpoints.sm
                  ? '280px'
                  : breakpoints.lg || breakpoints.xl
                  ? '480px'
                  : 'calc(100% - 32px)'
              }}
            >
              <BlockRenderer {...block} />
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
    </Container>
  )
}

export default Conductor
