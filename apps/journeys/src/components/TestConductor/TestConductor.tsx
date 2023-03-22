import { ReactElement, useEffect, useState } from 'react'
import SwiperCore, {
  Navigation,
  Pagination,
  Mousewheel,
  Keyboard
} from 'swiper'
import { findIndex } from 'lodash'
import Div100vh from 'react-div-100vh'
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react'
// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import { TreeBlock, useBlocks } from '@core/journeys/ui/block'
import { styled } from '@mui/material/styles'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import { BlockRenderer } from '@core/journeys/ui/BlockRenderer'
import { BlockFields_StepBlock as StepBlock } from '@core/journeys/ui/block/__generated__/BlockFields'

const StyledSwiperContainer = styled(Swiper)(({ theme }) => ({
  '.swiper-button-prev': {
    color: 'white',
    left: 'unset',
    right: 'calc(50% - 350px)',
    transform: 'rotate(90deg)',
    top: '45%',
    [theme.breakpoints.down('lg')]: {
      right: '36px'
    },

    [theme.breakpoints.down('md')]: {
      display: 'none',
      // top: 0,
      // left: 0,
      // width: '20%',
      // height: '100%',
      '&:after': {
        fontSize: '36px'

        // content: '""'
      }
    }
  },
  '.swiper-button-next': {
    color: 'white',
    right: 'calc(50% - 350px)',
    transform: 'rotate(90deg)',
    top: '55%',
    [theme.breakpoints.down('lg')]: {
      right: '36px'
    },
    [theme.breakpoints.down('md')]: {
      display: 'none',
      // top: 0,
      // right: 0,
      // width: '20%',
      // height: '100%',
      '&:after': {
        fontSize: '36px'
        // content: '""'
      }
    }
  },
  '.swiper-pagination-vertical.swiper-pagination-bullets': {
    right: 'calc(50% - 250px)',
    left: 'unset',
    [theme.breakpoints.down('md')]: {
      right: '24px'
    }
  },
  '.swiper-pagination-bullets-dynamic': {
    color: 'white'
    // top: '36px !important',
    // height: '16px'
  },
  '.swiper-pagination-bullet': {
    background: 'white'
  },
  '.swiper-pagination-bullet-active': {
    background: 'white'
  }
}))
const StyledSwiperSlide = styled(SwiperSlide)(() => ({}))

interface TestConductorProps {
  blocks: TreeBlock[]
}

export function TestConductor({ blocks }: TestConductorProps): ReactElement {
  console.log('blocks', blocks)
  const { setTreeBlocks, activeBlock, treeBlocks, setActiveBlock } = useBlocks()
  const [swiper, setSwiper] = useState<SwiperCore>()

  // const theme = useTheme()
  // const { journey } = useJourney()

  // Navigate to selected block if set
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

  useEffect(() => {
    setTreeBlocks(blocks)
  }, [setTreeBlocks, blocks])

  // function cardProgression(index: number, className: string): ReactElement {
  //   return <span className={className}>(index + 1) </span>
  // }

  return (
    <Div100vh style={{ overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <StyledSwiperContainer
        direction="vertical"
        modules={[Navigation, Pagination, Mousewheel, Keyboard]}
        navigation
        pagination={
          {
            // renderBullet: (index, className) => cardProgression(index, className)
            // dynamicBullets: true
          }
        }
        keyboard
        mousewheel={{
          sensitivity: 0.25,
          forceToAxis: true,
          thresholdDelta: 150
        }}
        autoplay={{ delay: 30000 }}
        spaceBetween={50}
        slidesPerView={1}
        onSlideChange={(swiper) => {
          console.log('slide change', swiper)
          setActiveBlock(treeBlocks[swiper.activeIndex] as TreeBlock<StepBlock>)
        }}
        onSwiper={(swiper) => {
          setSwiper(swiper)
          console.log(swiper)
        }}
        sx={{ height: 'inherit', background: '#000000e6' }}
      >
        {blocks.map((block) => {
          return (
            <StyledSwiperSlide key={block.id} sx={{ height: 'inherit' }}>
              <Stack sx={{ height: 'inherit' }}>
                <Paper
                  sx={{
                    width: { xs: '100%', md: '560px' },
                    height: { xs: '100%', md: '95%' },
                    margin: { xs: 0, md: 'auto' },
                    backgroundColor: 'divider',
                    borderRadius: { xs: 0, md: 4 }
                  }}
                >
                  <BlockRenderer block={block} />
                </Paper>
              </Stack>
            </StyledSwiperSlide>
          )
        })}
      </StyledSwiperContainer>
    </Div100vh>
  )
}
