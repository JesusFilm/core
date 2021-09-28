import { BlockRenderer } from '../BlockRenderer'
import { ReactElement, useEffect, useRef, useState } from 'react'
import { TreeBlock } from '../../libs/transformer/transformer'
import { useBlocks } from '../../libs/client/cache/blocks'
import SwiperCore, { Navigation } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import { findIndex } from 'lodash'
import { JourneyProgress } from '../JourneyProgress'
import 'swiper/css'
import { Box, Container } from '@mui/material'

interface ConductorProps {
  blocks: TreeBlock[]
}

export function Conductor({ blocks }: ConductorProps): ReactElement {
  const { setTreeBlocks, nextActiveBlock, treeBlocks, activeBlock } =
    useBlocks()
  const [swiper, setSwiper] = useState<SwiperCore>()
  const navigationPrevRef = useRef<HTMLDivElement>()
  const navigationNextRef = useRef<HTMLDivElement>()

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

  return (
    <Container sx={{ p: 0 }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
        <Box sx={{ width: 'calc(100% - 20px - 20px)' }}>
          <JourneyProgress />
        </Box>
      </Box>
      <Swiper
        modules={[Navigation]}
        spaceBetween={10}
        slidesPerView="auto"
        centeredSlides={true}
        onSlideChange={(swiper) =>
          nextActiveBlock(treeBlocks[swiper.activeIndex])
        }
        onSwiper={(swiper) => setSwiper(swiper)}
        navigation={{
          prevEl: navigationPrevRef.current,
          nextEl: navigationNextRef.current
        }}
      >
        {treeBlocks.map((block) => (
          <SwiperSlide
            key={block.id}
            style={{ width: 'calc(100% - 20px - 20px)' }}
          >
            <BlockRenderer {...block} />
          </SwiperSlide>
        ))}
        <Box
          ref={navigationPrevRef}
          sx={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            zIndex: 2,
            width: 20,
            left: 0,
            background: 'linear-gradient(90deg, #FFFF 0%, #FFF0 100%)'
          }}
        />
        <Box
          ref={navigationNextRef}
          sx={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            zIndex: 2,
            width: 20,
            right: 0,
            background: 'linear-gradient(90deg, #FFF0 0%, #FFFF 100%)'
          }}
        />
      </Swiper>
    </Container>
  )
}

export default Conductor
