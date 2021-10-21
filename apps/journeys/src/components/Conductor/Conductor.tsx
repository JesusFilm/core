import { BlockRenderer } from '../BlockRenderer'
import { ReactElement, useEffect, useState } from 'react'
import { TreeBlock } from '../../libs/transformer/transformer'
import { useBlocks } from '../../libs/client/cache/blocks'
import type SwiperCore from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import { findIndex } from 'lodash'
import { JourneyProgress } from '../JourneyProgress'
import { Box, Container } from '@mui/material'
import 'swiper/swiper.min.css'

interface ConductorProps {
  blocks: TreeBlock[]
}

export function Conductor({ blocks }: ConductorProps): ReactElement {
  const { setTreeBlocks, nextActiveBlock, treeBlocks, activeBlock } =
    useBlocks()
  const [swiper, setSwiper] = useState<SwiperCore>()

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

  return (
    // maxWidth set by: cardMaxWidth + navigationWidth x 2 + swiperSpaceBetween
    <Container disableGutters sx={{ maxWidth: { sm: 710, md: 904 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 6 }}>
        <Box sx={{ width: 'calc(100% - 20px - 20px - 10px)' }}>
          <JourneyProgress />
        </Box>
      </Box>
      <Swiper
        spaceBetween={10}
        slidesPerView="auto"
        centeredSlides={true}
        onSwiper={(swiper) => setSwiper(swiper)}
        allowTouchMove={false}
      >
        {treeBlocks.map((block) => (
          <SwiperSlide
            key={block.id}
            style={{
              width: 'calc(100% - 24px - 24px)',
              height: 'calc(100vh - 80px)',
              paddingTop: '4px',
              paddingBottom: '4px'
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
            width: 20,
            left: 0,
            background: (theme) => ({
              sm: `linear-gradient(90deg, ${theme.palette.background.default}FF 0%, ${theme.palette.background.default}00 100%)`
            })
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            zIndex: 2,
            width: 20,
            right: 0,
            background: (theme) => theme.palette.background.default,
            transition: 'opacity 0.5s ease-out',
            opacity: activeBlock?.nextBlockId != null ? 0 : 1
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
            width: 20,
            right: 0,
            background: (theme) => ({
              sm: `linear-gradient(90deg, ${theme.palette.background.default}00 0%, ${theme.palette.background.default}FF 100%)`
            })
          }}
        />
      </Swiper>
    </Container>
  )
}

export default Conductor
