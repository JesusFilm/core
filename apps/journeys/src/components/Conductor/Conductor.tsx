import { BlockRenderer } from '../BlockRenderer'
import { ReactElement, useEffect, useState } from 'react'
import { TreeBlock } from '../../libs/transformer/transformer'
import { useBlocks } from '../../libs/client/cache/blocks'
import { Navigation, Swiper as SwiperAPI } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css/bundle'
import { findIndex } from 'lodash'

interface ConductorProps {
  blocks: TreeBlock[]
}

export function Conductor({ blocks }: ConductorProps): ReactElement {
  const { setTreeBlocks, treeBlocks, activeBlock } = useBlocks()
  const [swiper, setSwiper] = useState<SwiperAPI>()

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
    <>
      <Swiper
        modules={[Navigation]}
        spaceBetween={50}
        slidesPerView={1}
        navigation
        onSlideChange={() => console.log('slide change')}
        onSwiper={(swiper) => setSwiper(swiper)}
        allowSlideNext={
          activeBlock?.__typename === 'StepBlock' && !activeBlock.locked
        }
      >
        {treeBlocks.map((block) => (
          <SwiperSlide key={block.id}>
            <BlockRenderer {...block} />
          </SwiperSlide>
        ))}
      </Swiper>
    </>
  )
}

export default Conductor
