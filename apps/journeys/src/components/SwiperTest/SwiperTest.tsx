import { ReactElement, useEffect } from 'react'
import { styled } from '@mui/material/styles'
import { Swiper, SwiperSlide } from 'swiper/react'
import SwiperCore, { Pagination } from 'swiper'
import Div100vh from 'react-div-100vh'
import type { TreeBlock } from '@core/journeys/ui/block'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { useBlocks } from '@core/journeys/ui/block'
import { BlockRenderer } from '@core/journeys/ui/BlockRenderer'

import 'swiper/swiper.min.css'
import 'swiper/components/pagination/pagination.min.css'

SwiperCore.use([Pagination])

const StyledSwiperContainer = styled(Swiper)(({ theme }) => ({
  background: 'grey',
  height: 'inherit',
  '.swiper-pagination': {
    height: 16,
    top: 16
  },
  '.swiper-pagination-bullet': {
    background: theme.palette.common.white,
    opacity: '60%'
  },
  '.swiper-pagination-bullet-active': {
    opacity: '100%'
  }
}))

interface Props {
  blocks: TreeBlock[]
}

export function SwiperTest({ blocks }: Props): ReactElement {
  const { treeBlocks, setTreeBlocks } = useBlocks()

  useEffect(() => {
    setTreeBlocks(blocks)
  }, [setTreeBlocks, blocks])

  return (
    <Div100vh style={{ overflow: 'hidden' }}>
      <Stack
        sx={{
          justifyContent: 'center',
          height: '100%',
          background: 'grey'
        }}
      >
        <Box sx={{ height: { xs: '100%', lg: 'unset' } }}>
          <StyledSwiperContainer
            pagination={{ dynamicBullets: true }}
            slidesPerView="auto"
            centeredSlides
            centeredSlidesBounds
            resizeObserver
            allowTouchMove
          >
            {treeBlocks.map((block) => {
              return (
                <SwiperSlide key={block.id}>
                  <Stack
                    justifyContent="center"
                    alignItems="center"
                    sx={{
                      maxHeight: { xs: '100vh', lg: 'calc(100vh - 80px)' },

                      height: {
                        xs: 'inherit',
                        lg: 'calc(54.25vw + 102px)'
                      },
                      px: { lg: 6 }
                    }}
                  >
                    <BlockRenderer block={block} />
                  </Stack>
                </SwiperSlide>
              )
            })}
          </StyledSwiperContainer>
        </Box>
      </Stack>
    </Div100vh>
  )
}
