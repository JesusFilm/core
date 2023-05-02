import { ReactElement, useEffect, useState, useRef } from 'react'
import SwiperCore, {
  Navigation,
  Swiper as SwiperType,
  Pagination,
  Keyboard,
  EffectFade
} from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/effect-fade'
import 'swiper/swiper.min.css'

import { findIndex } from 'lodash'
import { styled } from '@mui/material/styles'
import {
  nextActiveBlock,
  prevActiveBlock,
  TreeBlock,
  useBlocks
} from '@core/journeys/ui/block'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { BlockRenderer } from '@core/journeys/ui/BlockRenderer'
import { gql, useMutation } from '@apollo/client'
import { getJourneyRTL } from '@core/journeys/ui/rtl'
// Used to resolve dynamic viewport height on Safari
import Div100vh from 'react-div-100vh'
import { v4 as uuidv4 } from 'uuid'
import TagManager from 'react-gtm-module'
import { JourneyViewEventCreate } from '../../../__generated__/JourneyViewEventCreate'

export const JOURNEY_VIEW_EVENT_CREATE = gql`
  mutation JourneyViewEventCreate($input: JourneyViewEventCreateInput!) {
    journeyViewEventCreate(input: $input) {
      id
    }
  }
`
interface ConductorProps {
  blocks: TreeBlock[]
}

const StyledSwiperContainer = styled(Swiper)(({ theme }) => ({
  '.swiper-pagination.swiper-pagination-horizontal': {
    position: 'absolute',
    top: 16,
    height: 16,
    width: 100
  },
  '.swiper-pagination-bullet': {
    background: theme.palette.background.default,
    opacity: '60%'
  },
  '.swiper-pagination-bullet-active': {
    background: theme.palette.background.default,
    opacity: '100%'
  }
}))

const StyledSwiperSlide = styled(SwiperSlide)(() => ({}))

export function Conductor({ blocks }: ConductorProps): ReactElement {
  const { setTreeBlocks, treeBlocks, activeBlock, previousBlocks } = useBlocks()
  const [swiper, setSwiper] = useState<SwiperCore>()
  const swiperRef = useRef<SwiperType>()

  const { journey, admin } = useJourney()
  const { rtl } = getJourneyRTL(journey)

  // const onFirstStep = activeBlock === treeBlocks[0]
  // const onLastStep = activeBlock === last(treeBlocks)
  // const showLeftButton = (!rtl && !onFirstStep) || (rtl && !onLastStep)
  // const showRightButton = (!rtl && !onLastStep) || (rtl && !onFirstStep)
  // const disableLeftButton = !rtl || (rtl && activeBlock?.locked === true)
  // const disableRightButton = rtl || (!rtl && activeBlock?.locked === true)

  const [journeyViewEventCreate] = useMutation<JourneyViewEventCreate>(
    JOURNEY_VIEW_EVENT_CREATE
  )

  useEffect(() => {
    setTreeBlocks(blocks)

    if (!admin && journey != null) {
      const id = uuidv4()
      void journeyViewEventCreate({
        variables: {
          input: {
            id,
            journeyId: journey.id,
            label: journey.title,
            value: journey.language.id
          }
        }
      })
      TagManager.dataLayer({
        dataLayer: {
          event: 'journey_view',
          journeyId: journey.id,
          eventId: id,
          journeyTitle: journey.title
        }
      })
    }
  }, [])

  // Update Swiper - navigate to activeBlock after NavigateBlockAction & going back to node of a branch
  useEffect(() => {
    if (swiper != null && activeBlock != null && treeBlocks != null) {
      const index = findIndex(
        treeBlocks,
        (treeBlock) => treeBlock.id === activeBlock.id
      )
      if (index > -1 && swiper.activeIndex !== index) {
        console.log('button navigate', index, swiper.activeIndex)
        const allowFurtherOnSlideChange = false
        swiper.slideTo(index, 0, allowFurtherOnSlideChange)
      }
    }
  }, [swiper, activeBlock, treeBlocks])

  // Update activeBlock after Swiper swipe/tap navigation
  function handleNext(activeIndex: number): void {
    if (
      activeBlock != null &&
      !activeBlock.locked &&
      activeBlock.id !== treeBlocks[activeIndex].id
    )
      console.log('handleNext', activeIndex)
    nextActiveBlock({ id: undefined })
  }

  function handlePrev(activeIndex: number): void {
    if (activeBlock != null && activeBlock.id !== treeBlocks[activeIndex].id) {
      console.log('handlePrev', activeIndex)
      prevActiveBlock()
    }
  }

  return (
    <Div100vh style={{ overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <StyledSwiperContainer
        modules={[Navigation, Pagination, Keyboard, EffectFade]}
        onBeforeInit={(swiper) => {
          swiperRef.current = swiper
        }}
        navigation={{
          nextEl: 'swiper-button-next',
          prevEl: 'swiper-button-prev'
        }}
        pagination={{ dynamicBullets: true }}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        keyboard
        preventInteractionOnTransition
        dir={!rtl ? 'ltr' : 'rtl'}
        speed={0}
        onSwiper={(swiper) => setSwiper(swiper)}
        sx={{ width: '100%', height: 'inherit' }}
        onSetTranslate={(swiper) => {
          if (swiper.swipeDirection != null) {
            const visibleSlides = swiper.slides.filter((slides) =>
              slides.classList.contains('swiper-slide-visible')
            )

            if (visibleSlides.length === 2) {
              // Show - swiper-slide-active && swiper-slide-visible when swiper-slide-prev && swiper-slide-visible
              if (visibleSlides[0].classList.contains('swiper-slide-prev')) {
                visibleSlides[0].style.opacity = '0'
                visibleSlides[1].style.opacity = '1'
              }

              if (visibleSlides[1].classList.contains('swiper-slide-next')) {
                if (swiper.swipeDirection === 'prev') {
                  // Hide swiper-slide-active && swiper-slide-visible when swiper-slide-next && swiper-slide-visible
                  visibleSlides[0].style.opacity = '0'
                  visibleSlides[1].style.opacity = '0'
                  swiper.slides[
                    previousBlocks[previousBlocks.length - 2].parentOrder
                  ].style.opacity = '1'
                } else {
                  // Keep normal transition
                  visibleSlides[0].style.opacity = '1'
                  visibleSlides[1].style.opacity = '0'
                }
              }
            }
          }
        }}
        onBeforeSlideChangeStart={(swiper) => {
          console.log('swiper', swiper)
          // Update Swiper navigation after
          if (treeBlocks[swiper.activeIndex] !== activeBlock) {
            const index = findIndex(
              treeBlocks,
              (treeBlock) => treeBlock.id === activeBlock?.id
            )
            if (index > swiper.activeIndex) {
              console.log('change prev block')
              prevActiveBlock()
            } else {
              console.log('change next block')
              nextActiveBlock({ id: treeBlocks[swiper.activeIndex].id })
            }
          } else {
            console.log('normal swiper navigate')
            const allowFurtherOnSlideChange = false
            swiper.slideTo(swiper.activeIndex, 0, allowFurtherOnSlideChange)
          }
        }}
      >
        {blocks.map((block) => (
          <StyledSwiperSlide key={block.id} sx={{ height: 'inherit' }}>
            <BlockRenderer block={block} />
          </StyledSwiperSlide>
        ))}
        {/* {showLeftButton && <Navigation variant="Left" />}
        {showRightButton && <Navigation variant="Right" />} */}
      </StyledSwiperContainer>
    </Div100vh>
  )
}
