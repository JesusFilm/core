import { ReactElement, useEffect, useRef, useState } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import SwiperCore, {
  Navigation,
  Swiper as SwiperType,
  Pagination,
  Mousewheel,
  Keyboard,
  EffectFade
} from 'swiper'
import { findIndex } from 'lodash'
import Div100vh from 'react-div-100vh'
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react'
// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/effect-fade'
import { TreeBlock, useBlocks } from '@core/journeys/ui/block'
import { styled } from '@mui/material/styles'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import { BlockRenderer } from '@core/journeys/ui/BlockRenderer'
import { BlockFields_StepBlock as StepBlock } from '@core/journeys/ui/block/__generated__/BlockFields'
import LinearProgress from '@mui/material/LinearProgress'
import Box from '@mui/material/Box'

const StyledSwiperContainer = styled(Swiper)(({ theme }) => ({
  '.swiper-button-prev': {
    color: 'white',
    left: 'calc(50% - 280px)',
    width: '50%',
    height: '100%',
    '&:after': {
      fontSize: '36px',
      content: '""'
    },
    top: '2.5%',
    // left: 'unset',
    // right: 'calc(50% - 350px)',
    // transform: 'rotate(90deg)',
    // top: '45%',
    zIndex: 0,
    // [theme.breakpoints.down('lg')]: {
    //   left: '36px'
    // },

    [theme.breakpoints.down('sm')]: {
      // display: 'none',
      top: 0,
      left: 0
    }
  },
  '.swiper-button-next': {
    color: 'white',
    right: 'calc(50% - 280px)',
    width: '50%',
    height: '100%',
    top: '2.5%',
    '&:after': {
      fontSize: '36px',
      content: '""'
    },
    // transform: 'rotate(90deg)',
    // top: '55%',
    zIndex: 0,
    // [theme.breakpoints.down('lg')]: {
    //   right: '36px'
    // },
    [theme.breakpoints.down('sm')]: {
      // display: 'none',
      top: 0,
      right: 0
    }
  },
  '.swiper-pagination-vertical.swiper-pagination-bullets': {
    right: 'calc(50% - 264px)',
    left: 'unset',
    [theme.breakpoints.down('sm')]: {
      right: '10px'
    }
  },
  '.swiper-pagination-horizontal.swiper-pagination-custom': {
    top: '36px',
    [theme.breakpoints.down('sm')]: {
      top: '16px'
    }
  },
  '.swiper-pagination': {
    color: 'white',
    height: '28px'
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
  const swiperRef = useRef<SwiperType>()

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

  function cardProgression(
    swiper: SwiperCore,
    current: number,
    total: number
  ): string {
    // console.log('index', current, total, blockProgression)

    const chapters = (
      <Stack
        direction="row"
        justifyContent="space-between"
        width={{ xs: `calc(100% - 32px)`, sm: 536 }}
        sx={{ mx: 'auto', color: 'white' }}
      >
        {[...Array(total)].map((value, index) => {
          // const videoOnlyBlock =
          //   blocks[index].children[0].children[0].__typename === 'VideoBlock'

          return (
            <LinearProgress
              key={`chapter-${index + 1}`}
              variant="determinate"
              value={index < current ? 100 : 0}
              color="inherit"
              sx={{
                width: {
                  xs: `calc((100% - 32px)/${total})`,
                  sm: `calc(500px / ${total})`
                },
                height: '6px',
                borderRadius: '2px',
                backgroundColor: 'grey'
              }}
            />
          )
        })}
      </Stack>
    )
    return renderToStaticMarkup(chapters)
  }

  return (
    <Div100vh style={{ overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <StyledSwiperContainer
        modules={[Navigation, Pagination, Mousewheel, Keyboard, EffectFade]}
        onBeforeInit={(swiper) => {
          swiperRef.current = swiper
        }}
        navigation={{
          nextEl: 'swiper-button-next',
          prevEl: 'swiper-button-prev'
        }}
        pagination={{
          type: 'custom',
          renderCustom: (swiper, current, total) =>
            cardProgression(swiper, current, total)
        }}
        noSwiping
        fadeEffect={{ crossFade: true }}
        effect="fade"
        keyboard
        mousewheel={{
          sensitivity: 0.25,
          forceToAxis: true,
          thresholdDelta: 150
        }}
        spaceBetween={50}
        slidesPerView={1}
        onSlideChange={(swiper) => {
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
                  <BlockRenderer
                    block={block}
                    navigation={
                      <>
                        <Box
                          className="swiper-button-prev"
                          onClickCapture={() => swiperRef?.current?.slidePrev()}
                          sx={{
                            position: 'absolute',
                            top: 0,
                            width: { xs: '50%', md: '280px' }
                          }}
                        />
                        <Box
                          className="swiper-button-next"
                          onClickCapture={() => swiperRef?.current?.slideNext()}
                          sx={{
                            position: 'absolute',
                            top: 0,
                            width: { xs: '50%', md: '280px' }
                          }}
                        />
                      </>
                    }
                  />
                </Paper>
              </Stack>
            </StyledSwiperSlide>
          )
        })}
      </StyledSwiperContainer>
    </Div100vh>
  )
}
