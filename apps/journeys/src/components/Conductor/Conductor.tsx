import { createElement, ReactElement, useEffect, useState } from 'react'
import SwiperCore, { Pagination } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import Box from '@mui/material/Box'
import Fade from '@mui/material/Fade'
import Stack from '@mui/material/Stack'
import IconButton from '@mui/material/IconButton'
import { useTheme, styled } from '@mui/material/styles'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import type { TreeBlock } from '@core/journeys/ui/block'
import { getStepTheme } from '@core/journeys/ui/getStepTheme'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import {
  nextActiveBlock,
  prevActiveBlock,
  useBlocks
} from '@core/journeys/ui/block'
import { BlockRenderer } from '@core/journeys/ui/BlockRenderer'
import ChevronLeftIcon from '@core/shared/ui/icons/ChevronLeft'
import ChevronRightIcon from '@core/shared/ui/icons/ChevronRight'
import { gql, useMutation } from '@apollo/client'
import { getJourneyRTL } from '@core/journeys/ui/rtl'
import { StepHeader } from '@core/journeys/ui/StepHeader'
import { StepFooter } from '@core/journeys/ui/StepFooter'
// Used to resolve dynamic viewport height on Safari
import Div100vh from 'react-div-100vh'
import { v4 as uuidv4 } from 'uuid'
import TagManager from 'react-gtm-module'
import last from 'lodash/last'
import { JourneyViewEventCreate } from '../../../__generated__/JourneyViewEventCreate'
import { StepFields } from '../../../__generated__/StepFields'
import { VisitorUpdateInput } from '../../../__generated__/globalTypes'

import 'swiper/swiper.min.css'
import 'swiper/components/pagination/pagination.min.css'

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
  height: 'inherit',
  '.swiper-pagination': {
    height: 16,
    top: 16,
    width: '84px !important'
  },
  '.swiper-pagination-bullet': {
    background: theme.palette.common.white,
    opacity: '60%'
  },
  '.swiper-pagination-bullet-active': {
    opacity: '100%'
  }
}))
export const JOURNEY_VISITOR_UPDATE = gql`
  mutation VisitorUpdateForCurrentUser($input: VisitorUpdateInput!) {
    visitorUpdateForCurrentUser(input: $input) {
      id
    }
  }
`

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
  const {
    setTreeBlocks,
    setBlockHistory,
    treeBlocks,
    blockHistory,
    showHeaderFooter,
    showNavigation
  } = useBlocks()
  const [swiper, setSwiper] = useState<SwiperCore>()
  const [slideTransitioning, setSlideTransitioning] = useState(false)
  const theme = useTheme()
  const { journey, admin } = useJourney()
  const { locale, rtl } = getJourneyRTL(journey)
  const activeBlock = blockHistory[
    blockHistory.length - 1
  ] as TreeBlock<StepFields>

  const onFirstStep = activeBlock === treeBlocks[0]
  const onLastStep = activeBlock === last(treeBlocks)
  const showLeftButton = (!rtl && !onFirstStep) || (rtl && !onLastStep)
  const showRightButton = (!rtl && !onLastStep) || (rtl && !onFirstStep)
  const disableLeftButton = rtl && activeBlock?.locked
  const disableRightButton = !rtl && activeBlock?.locked

  const [journeyViewEventCreate] = useMutation<JourneyViewEventCreate>(
    JOURNEY_VIEW_EVENT_CREATE
  )

  const [journeyVisitorUpdate] = useMutation<VisitorUpdateInput>(
    JOURNEY_VISITOR_UPDATE
  )

  useEffect(() => {
    setTreeBlocks(blocks)
    setBlockHistory([blocks[0]])

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
      }).then(() => {
        void fetch('/api/geolocation').then((response) => {
          void response
            .json()
            .then(
              (data: { city?: string; country?: string; region?: string }) => {
                const countryCodes: string[] = []
                if (data.city != null) countryCodes.push(data.city)
                if (data.region != null) countryCodes.push(data.region)
                if (data.country != null) countryCodes.push(data.country)

                if (countryCodes.length > 0 || document.referrer !== '') {
                  void journeyVisitorUpdate({
                    variables: {
                      input: {
                        countryCode:
                          countryCodes.length > 0
                            ? countryCodes.join(', ')
                            : undefined,
                        referrer: document.referrer
                      }
                    }
                  })
                }
              }
            )
        })
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
  }, [journey])

  useEffect(() => {
    setTreeBlocks(blocks)
  }, [setTreeBlocks, blocks])

  // Update Swiper - navigate to activeBlock after NavigateBlockAction & going back to node of a branch
  useEffect(() => {
    if (swiper != null && blockHistory.length > 0) {
      const activeIndex = blockHistory[blockHistory.length - 1].parentOrder
      if (activeIndex != null && swiper.activeIndex !== activeIndex) {
        const allowFurtherOnSlideChange = false
        swiper.slideTo(activeIndex, 0, allowFurtherOnSlideChange)
      }
    }
    setSlideTransitioning(false)
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

  const Navigation = ({
    variant
  }: {
    variant: 'prev' | 'next'
  }): ReactElement => {
    // Issue using https://mui.com/material-ui/guides/right-to-left/#emotion-amp-styled-components for justifyContent
    const alignment =
      (rtl && variant === 'next') || (!rtl && variant === 'prev')
        ? 'left'
        : 'right'
    const alignSx =
      alignment === 'left'
        ? { justifyContent: 'flex-start' }
        : { justifyContent: 'flex-end' }

    const iconName = alignment === 'left' ? ChevronLeftIcon : ChevronRightIcon
    const icon = createElement(iconName, {
      fontSize: 'large'
    })
    const NavigationContainer =
      alignment === 'left' ? LeftNavigationContainer : RightNavigationContainer

    return (
      <NavigationContainer
        data-testid={`${variant.toLowerCase()}NavContainer`}
        sx={{
          ...alignSx,
          position: 'absolute',
          top: { xs: '20%', sm: '32%', md: '20%' },
          bottom: 0,
          zIndex: 2,
          display: slideTransitioning ? 'none' : 'flex',
          width: { xs: 82, lg: 114 },
          height: { xs: '55%', sm: '25%', md: '60%', lg: '59%' },
          alignItems: 'center'
        }}
      >
        <IconButton
          data-testid={`conductor${variant}Button`}
          onClick={() => handleNav(activeBlock.parentOrder ?? 0, variant)}
          disabled={
            alignment === 'left' ? disableLeftButton : disableRightButton
          }
          disableRipple
          sx={{
            mx: { xs: 4, lg: 13 },
            color: 'primary',
            backgroundColor: (theme) => `${theme.palette.grey[50]}26`,
            '&:hover': {
              backgroundColor: (theme) => `${theme.palette.grey[50]}0d`
            }
          }}
        >
          {icon}
        </IconButton>
      </NavigationContainer>
    )
  }

  console.log('blockHistory', blockHistory)

  return (
    <Div100vh style={{ overflow: 'hidden' }}>
      <Stack
        sx={{
          justifyContent: 'center',
          height: '100%',
          background: theme.palette.grey[900]
        }}
      >
        <Box sx={{ height: { xs: '100%', lg: 'unset' } }}>
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
            sx={{
              '.swiper-pagination': {
                display: showHeaderFooter ? 'block' : 'none'
              }
            }}
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
                          maxHeight: { xs: '100vh', lg: 'calc(100vh - 80px)' },
                          height: {
                            xs: 'inherit',
                            lg: 'calc(54.25vw + 102px)'
                          },
                          px: { lg: 6 }
                        }}
                      >
                        {showHeaderFooter && <StepHeader />}
                        <BlockRenderer block={block} />
                        <StepFooter
                          sx={{
                            visibility: showHeaderFooter ? 'visible' : 'hidden'
                          }}
                        />
                      </Stack>
                    </Fade>
                  </ThemeProvider>
                </SwiperSlide>
              )
            })}
            {showLeftButton && showNavigation && (
              <Navigation variant={rtl ? 'next' : 'prev'} />
            )}
            {showRightButton && showNavigation && (
              <Navigation variant={rtl ? 'prev' : 'next'} />
            )}
          </StyledSwiperContainer>
        </Box>
      </Stack>
    </Div100vh>
  )
}
