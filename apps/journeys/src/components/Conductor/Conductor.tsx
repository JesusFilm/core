import { ReactElement, useEffect, useState, useRef } from 'react'
import SwiperCore, {
  Navigation,
  Swiper as SwiperType,
  Pagination,
  Keyboard,
  EffectFade
} from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css/pagination'
import 'swiper/css/effect-fade'
import 'swiper/swiper.min.css'

import { findIndex } from 'lodash'
import { styled } from '@mui/material/styles'
import type { TreeBlock } from '@core/journeys/ui/block'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { useBlocks } from '@core/journeys/ui/block'
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
  const { setTreeBlocks, treeBlocks, activeBlock } = useBlocks()
  const [swiper, setSwiper] = useState<SwiperCore>()
  const swiperRef = useRef<SwiperType>()

  console.log('blocks', blocks)

  // const [slideTransitioning, setSlideTransitioning] = useState(false)
  // const breakpoints = useBreakpoints()
  // const theme = useTheme()
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
  }, [admin, journey, journeyViewEventCreate])

  useEffect(() => {
    setTreeBlocks(blocks)
  }, [setTreeBlocks, blocks])

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

  // function handleNext(): void {
  //   if (activeBlock != null && !activeBlock.locked) nextActiveBlock()
  // }

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
        dir={!rtl ? 'ltr' : 'rtl'}
        onSwiper={(swiper) => setSwiper(swiper)}
        sx={{ width: '100%', height: 'inherit' }}
      >
        {treeBlocks.map((block) => (
          <StyledSwiperSlide key={block.id} sx={{ height: 'inherit' }}>
            {/* <Fade
                in={activeBlock?.id === block.id}
                mountOnEnter
                unmountOnExit
              > */}
            <BlockRenderer block={block} />
            {/* </Fade> */}
          </StyledSwiperSlide>
        ))}
        {/* {showLeftButton && <Navigation variant="Left" />}
        {showRightButton && <Navigation variant="Right" />} */}
      </StyledSwiperContainer>
    </Div100vh>
  )
}
