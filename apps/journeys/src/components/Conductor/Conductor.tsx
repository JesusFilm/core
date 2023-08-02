import { ReactElement, useEffect, useState } from 'react'
import SwiperCore, { Pagination } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import Box from '@mui/material/Box'
import Fade from '@mui/material/Fade'
import Stack from '@mui/material/Stack'
import { useTheme, styled } from '@mui/material/styles'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import type { TreeBlock } from '@core/journeys/ui/block'
import { getStepTheme } from '@core/journeys/ui/getStepTheme'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { useBlocks } from '@core/journeys/ui/block'
import { BlockRenderer } from '@core/journeys/ui/BlockRenderer'
import { gql, useMutation } from '@apollo/client'
import { getJourneyRTL } from '@core/journeys/ui/rtl'
import { StepHeader } from '@core/journeys/ui/StepHeader'
import { StepFooter } from '@core/journeys/ui/StepFooter'
// Used to resolve dynamic viewport height on Safari
import Div100vh from 'react-div-100vh'
import { v4 as uuidv4 } from 'uuid'
import TagManager from 'react-gtm-module'
import Typography from '@mui/material/Typography'
import { JourneyViewEventCreate } from '../../../__generated__/JourneyViewEventCreate'
import { StepFields } from '../../../__generated__/StepFields'
import { VisitorUpdateInput } from '../../../__generated__/globalTypes'
import { useHasNotch } from '../../libs/useHasNotch/useHasNotch'

import 'swiper/swiper.min.css'
import 'swiper/components/pagination/pagination.min.css'
import { NavigationButton } from './NavigationButton'
import { env } from 'process'

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
interface ConductorProps {
  blocks: TreeBlock[]
}

export function Conductor({ blocks }: ConductorProps): ReactElement {
  const {
    setTreeBlocks,
    setShowNavigation,
    setShowHeaderFooter,
    treeBlocks,
    blockHistory,
    showHeaderFooter
  } = useBlocks()
  const [swiper, setSwiper] = useState<SwiperCore>()
  const theme = useTheme()
  const { journey, admin } = useJourney()
  const { locale, rtl } = getJourneyRTL(journey)
  const activeBlock = blockHistory[
    blockHistory.length - 1
  ] as TreeBlock<StepFields>

  const [journeyViewEventCreate] = useMutation<JourneyViewEventCreate>(
    JOURNEY_VIEW_EVENT_CREATE
  )

  const [journeyVisitorUpdate] = useMutation<VisitorUpdateInput>(
    JOURNEY_VISITOR_UPDATE
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [journey])

  useEffect(() => {
    setTreeBlocks(blocks)
  }, [setTreeBlocks, blocks])

  // Update Swiper - navigate to activeBlock after NavigateBlockAction & going back to node of a branch
  useEffect(() => {
    if (
      swiper != null &&
      blockHistory.length > 0 &&
      blockHistory[blockHistory.length - 1] != null
    ) {
      const activeIndex = blockHistory[blockHistory.length - 1].parentOrder
      if (activeIndex != null && swiper.activeIndex !== activeIndex) {
        const allowFurtherOnSlideChange = false
        swiper.slideTo(activeIndex, 0, allowFurtherOnSlideChange)
      }
    }
  }, [swiper, blockHistory])

  return (
    <Div100vh style={{ overflow: 'hidden' }}>
      <Stack
        sx={{
          justifyContent: 'center',
          height: '100%',
          background: theme.palette.grey[900],
          pt: 'env(safe-area-inset-top)',
          pl: 'env(safe-area-inset-left)',
          pr: 'env(safe-area-inset-right)',
          pb: 'env(safe-area-inset-bottom)'
        }}
        data-testid="conductor-cover-box"
        // sx={{
        //   pt: 'env(safe-area-inset-top)',
        //   pl: 'env(safe-area-inset-left)',
        //   pr: 'env(safe-area-inset-right)',
        //   pb: 'env(safe-area-inset-bottom)'
        // }}
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
            allowTouchMove={false}
            onSlideChange={() => setShowHeaderFooter(true)}
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
                <SwiperSlide
                  onClick={() => setShowNavigation(true)}
                  key={block.id}
                >
                  <ThemeProvider {...theme} locale={locale} rtl={rtl} nested>
                    <Fade
                      in={activeBlock?.id === block.id}
                      mountOnEnter
                      unmountOnExit
                    >
                      <Stack
                        justifyContent="center"
                        sx={{
                          maxHeight: {
                            xs: '100vh',
                            lg: 'calc(100vh - 80px)'
                          },
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
            <NavigationButton
              variant={rtl ? 'next' : 'prev'}
              alignment="left"
            />
            <NavigationButton
              variant={rtl ? 'prev' : 'next'}
              alignment="right"
            />
          </StyledSwiperContainer>
        </Box>
      </Stack>
    </Div100vh>
  )
}
