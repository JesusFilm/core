import { createElement, ReactElement, useEffect, useState } from 'react'
import SwiperCore, { Pagination } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import { findIndex } from 'lodash'
import Box from '@mui/material/Box'
import Fade from '@mui/material/Fade'
import Stack from '@mui/material/Stack'
import IconButton from '@mui/material/IconButton'
import { useTheme, styled } from '@mui/material/styles'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import type { TreeBlock } from '@core/journeys/ui/block'
import { getStepTheme } from '@core/journeys/ui/getStepTheme'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { useBlocks } from '@core/journeys/ui/block'
import { BlockRenderer } from '@core/journeys/ui/BlockRenderer'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { gql, useMutation } from '@apollo/client'
import { getJourneyRTL } from '@core/journeys/ui/rtl'
import { StepHeader } from '@core/journeys/ui/StepHeader'
// Used to resolve dynamic viewport height on Safari
import Div100vh from 'react-div-100vh'
import { v4 as uuidv4 } from 'uuid'
import TagManager from 'react-gtm-module'
import last from 'lodash/last'
import { JourneyViewEventCreate } from '../../../__generated__/JourneyViewEventCreate'

import 'swiper/swiper.min.css'
import 'swiper/components/pagination/pagination.min.css'
import { StepFields } from '../../../__generated__/StepFields'

SwiperCore.use([Pagination])

export const JOURNEY_VIEW_EVENT_CREATE = gql`
  mutation JourneyViewEventCreate($input: JourneyViewEventCreateInput!) {
    journeyViewEventCreate(input: $input) {
      id
    }
  }
`

const StyledSwiperContainer = styled(Swiper)(({ theme }) => ({
  background: theme.palette.grey[900],
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

const LeftNavigationContainer = styled(Box)`
  /* @noflip */
  left: 0;
`
const RightNavigationContainer = styled(Box)`
  /* @noflip */
  right: 0;
`
interface ConductorProps {
  blocks: TreeBlock[]
}

export function Conductor({ blocks }: ConductorProps): ReactElement {
  const { setTreeBlocks, nextActiveBlock, treeBlocks, activeBlock } =
    useBlocks()
  const [swiper, setSwiper] = useState<SwiperCore>()
  const [slideTransitioning, setSlideTransitioning] = useState(false)
  const theme = useTheme()
  const { journey, admin } = useJourney()
  const { locale, rtl } = getJourneyRTL(journey)

  const onFirstStep = activeBlock === treeBlocks[0]
  const onLastStep = activeBlock === last(treeBlocks)
  const showLeftButton = (!rtl && !onFirstStep) || (rtl && !onLastStep)
  const showRightButton = (!rtl && !onLastStep) || (rtl && !onFirstStep)
  const disableLeftButton = !rtl || (rtl && activeBlock?.locked === true)
  const disableRightButton = rtl || (!rtl && activeBlock?.locked === true)

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

  function handleNext(): void {
    if (activeBlock != null && !activeBlock.locked) nextActiveBlock()
  }

  const Navigation = ({
    variant
  }: {
    variant: 'Left' | 'Right'
  }): ReactElement => {
    // Issue using https://mui.com/material-ui/guides/right-to-left/#emotion-amp-styled-components for justifyContent
    const alignSx =
      (rtl && variant === 'Left') || (!rtl && variant === 'Right')
        ? { justifyContent: 'flex-start' }
        : { justifyContent: 'flex-end' }

    const iconName = variant === 'Left' ? ChevronLeftIcon : ChevronRightIcon
    const icon = createElement(iconName, {
      fontSize: 'large'
    })
    const NavigationContainer =
      variant === 'Left' ? LeftNavigationContainer : RightNavigationContainer

    return (
      <NavigationContainer
        data-testid={`${variant.toLowerCase()}NavContainer`}
        sx={{
          ...alignSx,
          position: 'absolute',
          top: '10%',
          bottom: 0,
          zIndex: 2,
          display: slideTransitioning ? 'none' : 'flex',
          width: { xs: 82, lg: 114 },
          height: '80%'
        }}
      >
        <IconButton
          data-testid={`conductor${variant}Button`}
          onClick={handleNext}
          disabled={variant === 'Left' ? disableLeftButton : disableRightButton}
          disableRipple
          sx={{
            px: 13,
            color: 'primary.contrastText',
            '&:hover': { color: 'primary.contrastText' }
          }}
        >
          {icon}
        </IconButton>
      </NavigationContainer>
    )
  }

  return (
    <Div100vh style={{ overflow: 'hidden' }}>
      <Stack
        sx={{
          justifyContent: 'center',
          height: '100%',
          background: theme.palette.grey[900]
        }}
      >
        <Box>
          <StyledSwiperContainer
            dir={!rtl ? 'ltr' : 'rtl'}
            pagination={{ dynamicBullets: true }}
            slidesPerView="auto"
            centeredSlides
            centeredSlidesBounds
            resizeObserver
            onSwiper={(swiper) => setSwiper(swiper)}
            onSlideChangeTransitionStart={() => setSlideTransitioning(true)}
            onSlideChangeTransitionEnd={() => setSlideTransitioning(false)}
            allowTouchMove={false}
          >
            {treeBlocks.map((block) => {
              const theme = getStepTheme(
                block as TreeBlock<StepFields>,
                journey
              )
              return (
                <SwiperSlide key={block.id}>
                  <ThemeProvider {...theme} locale={locale} rtl={rtl} nested>
                    <Fade
                      in={activeBlock?.id === block.id}
                      mountOnEnter
                      unmountOnExit
                    >
                      <Stack
                        justifyContent="center"
                        sx={{
                          maxHeight: { xs: '100vh', lg: 'calc(100vh - 160px)' },
                          height: { xs: '100vh', lg: '56.25vw' },
                          px: { lg: 6 }
                        }}
                      >
                        <StepHeader />
                        <BlockRenderer block={block} />
                      </Stack>
                    </Fade>
                  </ThemeProvider>
                </SwiperSlide>
              )
            })}
            {showLeftButton && <Navigation variant="Left" />}
            {showRightButton && <Navigation variant="Right" />}
          </StyledSwiperContainer>
        </Box>
      </Stack>
    </Div100vh>
  )
}
