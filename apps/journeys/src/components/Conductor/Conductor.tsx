import { ReactElement, useEffect, useState, useRef } from 'react'
import SwiperCore, {
  Navigation,
  Swiper as SwiperType,
  Pagination,
  EffectFade
} from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css/pagination'
import 'swiper/css/effect-fade'
import 'swiper/swiper.min.css'

import { styled, useTheme } from '@mui/material/styles'
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
import Fade from '@mui/material/Fade'
import Stack from '@mui/material/Stack'
import ChevronLeftRounded from '@mui/icons-material/ChevronLeftRounded'
import ChevronRightRounded from '@mui/icons-material/ChevronRightRounded'
import { StepFields } from '@core/journeys/ui/Step/__generated__/StepFields'
import StepHeader from '@core/journeys/ui/StepHeader'
import StepFooter from '@core/journeys/ui/StepFooter'
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
  '--swiper-pagination-top': '16px',
  [theme.breakpoints.up('lg')]: {
    '--swiper-pagination-top': 'max(12px, calc(44vh - 26vw))'
  },
  '.swiper-pagination.swiper-pagination-horizontal': {
    position: 'absolute',
    height: 16,
    width: 100
  },
  '.swiper-pagination-bullet': {
    background: theme.palette.common.white,
    opacity: '60%'
  },
  '.swiper-pagination-bullet-active': {
    opacity: '100%'
  }
}))

const StyledSwiperSlide = styled(SwiperSlide)(({ theme }) => ({
  '&.swiper-slide': {
    background: theme.palette.grey[900]
  }
}))

const StyledNavArea = styled(Stack)(({ theme }) => ({
  position: 'absolute',
  justifyContent: 'center',
  width: 48,
  height: 'calc(100% - 280px)',
  zIndex: 3,
  bottom: '140px',
  [theme.breakpoints.up('lg')]: {
    width: 60,
    height: 'calc(100% - 58vh)',
    bottom: 'calc(25% + 56px)'
  }
}))

export function Conductor({ blocks }: ConductorProps): ReactElement {
  const { setTreeBlocks, treeBlocks, blockHistory } = useBlocks()
  const [swiper, setSwiper] = useState<SwiperCore>()
  const [visibleNav, setVisibleNav] = useState(true)
  const swiperRef = useRef<SwiperType>()
  const { journey, admin } = useJourney()
  const { rtl } = getJourneyRTL(journey)
  const theme = useTheme()

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
    // eslint-disable-next-line
  }, [])

  useEffect(() => {
    setTimeout(() => {
      setVisibleNav(false)
    }, 3000)
  }, [])

  // Update Swiper - navigate to activeBlock after NavigateBlockAction & going back to node of a branch
  useEffect(() => {
    if (swiper != null && blockHistory.length > 0) {
      const activeIndex = blockHistory[blockHistory.length - 1].parentOrder
      if (activeIndex != null && swiper.activeIndex !== activeIndex) {
        const allowFurtherOnSlideChange = false
        swiper.slideTo(activeIndex, 0, allowFurtherOnSlideChange)
      }
    }
  }, [swiper, blockHistory])

  // Update activeBlock after Swiper swipe/tap navigation
  function handleNav(activeIndex: number, direction: 'next' | 'prev'): void {
    const activeBlock = treeBlocks[activeIndex] as TreeBlock<StepFields>

    if (direction === 'next' && !activeBlock.locked) {
      const targetBlockId =
        activeBlock.nextBlockId ??
        (activeIndex < treeBlocks.length - 1
          ? treeBlocks[activeIndex + 1].id
          : null)
      if (targetBlockId != null) nextActiveBlock({ id: targetBlockId })
    } else {
      const targetBlockId = activeIndex >= 0 ? treeBlocks[activeIndex].id : null
      if (targetBlockId != null) prevActiveBlock({ id: targetBlockId })
    }
  }

  const arrowProps = {
    sx: {
      fontSize: '44px',
      borderRadius: 6,
      ml: 2,
      backgroundColor: `${theme.palette.common.black}00010`,
      '&:hover': {
        backgroundColor: `${theme.palette.common.black}00030`
      }
    },
    viewBox: '0 0 25 24',
    htmlColor: theme.palette.common.white
  }

  const LeftArrow = <ChevronLeftRounded {...arrowProps} />
  const RightArrow = <ChevronRightRounded {...arrowProps} />

  return (
    <Div100vh style={{ overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <StyledSwiperContainer
        modules={[Navigation, Pagination, EffectFade]}
        onBeforeInit={(swiper) => {
          swiperRef.current = swiper
        }}
        navigation={{
          enabled: true,
          prevEl: 'button-prev',
          nextEl: 'button-next'
        }}
        pagination={{ dynamicBullets: true }}
        effect="fade"
        fadeEffect={{ crossFade: true }}
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
              if (visibleSlides[0].classList.contains('swiper-slide-prev')) {
                visibleSlides[0].style.opacity = '0'
                visibleSlides[1].style.opacity = '1'
                if (blockHistory.length > 1) {
                  swiper.slides[
                    blockHistory[blockHistory.length - 2].parentOrder ?? 0
                  ].style.opacity = '1'
                }
              }

              if (visibleSlides[1].classList.contains('swiper-slide-next')) {
                if (swiper.swipeDirection === 'prev') {
                  visibleSlides[0].style.opacity = '0'
                  visibleSlides[1].style.opacity = '1'
                } else {
                  // Keep normal transition
                  visibleSlides[0].style.opacity = '1'
                  visibleSlides[1].style.opacity = '0'
                }
              }
            }
          }
        }}
        // Hide Navigation after swiping
        onTouchMove={() => {
          setVisibleNav(true)
          setTimeout(() => {
            setVisibleNav(false)
          }, 3000)
        }}
        onActiveIndexChange={(swiper) => {
          // Indices from useBlock state
          const activeIndex = blockHistory[blockHistory.length - 1].parentOrder
          // Update useBlock history stack
          if (activeIndex != null) {
            if (swiper.swipeDirection === 'prev') {
              // Trigger slide change via useEffect
              if (
                activeIndex !== swiper.activeIndex &&
                swiper.activeIndex < swiper.previousIndex
              ) {
                prevActiveBlock({ id: treeBlocks[activeIndex].id })
              } else {
                swiper.slideTo(activeIndex, 0, false)
              }
            } else if (swiper.swipeDirection === 'next') {
              // Navigate via button
              nextActiveBlock({ id: treeBlocks[swiper.activeIndex].id })
            } else {
              // useBlock history is updated from action.ts
            }
          }
        }}
      >
        {blocks.map((block) => (
          <StyledSwiperSlide key={block.id} onClick={() => setVisibleNav(true)}>
            <Stack
              justifyContent="center"
              sx={{ width: '100%', height: '100%' }}
            >
              <StepHeader block={block} />
              <BlockRenderer block={block} />
              <StepFooter block={block} />
            </Stack>
          </StyledSwiperSlide>
        ))}
        {blockHistory.length > 1 &&
          blockHistory[blockHistory.length - 1].parentOrder !== 0 && (
            <StyledNavArea
              className="button-prev"
              sx={{ left: { xs: 0, lg: 24 } }}
              onClick={() => handleNav(swiper?.activeIndex ?? 0, 'prev')}
              // Show / Hide navigation after tapping
              onMouseOver={() => setVisibleNav(true)}
              onMouseLeave={() => {
                if (visibleNav) setVisibleNav(false)
              }}
            >
              <Fade
                in={visibleNav}
                style={{ position: 'absolute' }}
                timeout={{
                  appear: 0,
                  exit: blockHistory.length > 1 ? 2000 : 0
                }}
              >
                {rtl ? RightArrow : LeftArrow}
              </Fade>
            </StyledNavArea>
          )}
        {blockHistory.length > 0 &&
          blockHistory[blockHistory.length - 1].parentOrder !==
            treeBlocks.length - 1 &&
          !(blockHistory[blockHistory.length - 1] as TreeBlock<StepFields>)
            .locked && (
            <StyledNavArea
              className="button-next"
              sx={{
                right: { xs: 0, lg: 24 },
                mr: 2,
                alignItems: 'flex-end'
              }}
              onClick={() => handleNav(swiper?.activeIndex ?? 0, 'next')}
              // Show / Hide navigation after tapping
              onMouseOver={() => setVisibleNav(true)}
              onMouseLeave={() => {
                if (visibleNav) {
                  setVisibleNav(false)
                }
              }}
            >
              <Fade
                in={visibleNav}
                style={{ position: 'absolute' }}
                timeout={{
                  appear: 300,
                  exit:
                    blockHistory[blockHistory.length - 1].parentOrder !==
                    treeBlocks.length - 1
                      ? 2000
                      : 0
                }}
              >
                {rtl ? LeftArrow : RightArrow}
              </Fade>
            </StyledNavArea>
          )}
      </StyledSwiperContainer>
    </Div100vh>
  )
}
