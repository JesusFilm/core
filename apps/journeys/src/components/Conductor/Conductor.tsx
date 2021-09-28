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
  const navigationPrevRef = useRef(null)
  const navigationNextRef = useRef(null)

  useEffect(() => {
    setTreeBlocks(blocks)
  }, [setTreeBlocks, blocks])

  useEffect(() => {
    swiper?.slideTo(
      findIndex(
        treeBlocks,
        (treeBlock) => activeBlock != null && treeBlock.id === activeBlock.id
      )
    )
  }, [swiper, activeBlock, treeBlocks])

  return (
    <Container>
      <JourneyProgress />
      <Swiper
        modules={[Navigation]}
        spaceBetween={20}
        slidesPerView="auto"
        centeredSlides={true}
        onSlideChange={(swiper) =>
          nextActiveBlock(treeBlocks[swiper.activeIndex])
        }
        onSwiper={(swiper) => setSwiper(swiper)}
        allowSlideNext={activeBlock !== null && !activeBlock.locked}
        navigation={{
          prevEl: navigationPrevRef.current,
          nextEl: navigationNextRef.current
        }}
      >
        {treeBlocks.map((block) => (
          <SwiperSlide key={block.id} style={{ width: '80%' }}>
            <BlockRenderer {...block} />
          </SwiperSlide>
        ))}
        <Box
          ref={navigationPrevRef}
          sx={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            zIndex: 2,
            width: '10%',
            background:
              'linear-gradient(90deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)'
          }}
        />
        <Box
          ref={navigationNextRef}
          sx={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            zIndex: 2,
            width: '10%',
            background:
              'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%)'
          }}
        />
      </Swiper>
    </Container>
  )
}

export default Conductor
