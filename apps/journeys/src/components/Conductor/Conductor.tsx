import { createElement, ReactElement, useEffect, useState } from 'react'
import SwiperCore from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import { findIndex } from 'lodash'
import Box from '@mui/material/Box'
import Fade from '@mui/material/Fade'
import Stack from '@mui/material/Stack'
import IconButton from '@mui/material/IconButton'
import { useTheme, styled } from '@mui/material/styles'
import type { TreeBlock } from '@core/journeys/ui/block'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { useBlocks } from '@core/journeys/ui/block'
import { BlockRenderer } from '@core/journeys/ui/BlockRenderer'
import { CardWrapper } from '@core/journeys/ui/Card'
import { useBreakpoints } from '@core/shared/ui/useBreakpoints'
import 'swiper/swiper.min.css'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { gql, useMutation } from '@apollo/client'
import { getJourneyRTL } from '@core/journeys/ui/rtl'
// Used to resolve dynamic viewport height on Safari
import Div100vh from 'react-div-100vh'
import { v4 as uuidv4 } from 'uuid'
import TagManager from 'react-gtm-module'
import last from 'lodash/last'
import { JourneyViewEventCreate } from '../../../__generated__/JourneyViewEventCreate'
import { Footer } from '../Footer'
import { VisitorUpdateInput } from '../../../__generated__/globalTypes'

export const JOURNEY_VIEW_EVENT_CREATE = gql`
  mutation JourneyViewEventCreate($input: JourneyViewEventCreateInput!) {
    journeyViewEventCreate(input: $input) {
      id
    }
  }
`

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
  const { setTreeBlocks, nextActiveBlock, treeBlocks, activeBlock } =
    useBlocks()
  const [swiper, setSwiper] = useState<SwiperCore>()
  const [slideTransitioning, setSlideTransitioning] = useState(false)
  const breakpoints = useBreakpoints()
  const theme = useTheme()
  const { journey, admin } = useJourney()
  const { rtl } = getJourneyRTL(journey)

  const onFirstStep = activeBlock === treeBlocks[0]
  const onLastStep = activeBlock === last(treeBlocks)
  const showLeftButton = (!rtl && !onFirstStep) || (rtl && !onLastStep)
  const showRightButton = (!rtl && !onLastStep) || (rtl && !onFirstStep)
  const disableLeftButton = !rtl || (rtl && activeBlock?.locked === true)
  const disableRightButton = rtl || (!rtl && activeBlock?.locked === true)

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

                if (countryCodes.length > 0 || document.referrer != null) {
                  void journeyVisitorUpdate({
                    variables: {
                      input: {
                        countryCode:
                          countryCodes.length > 0
                            ? countryCodes.join(', ')
                            : undefined,
                        referrer: document.referrer ?? undefined
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

  const [windowWidth, setWindowWidth] = useState(theme.breakpoints.values.xl)

  useEffect(() => {
    const updateWidth = (): void => {
      setWindowWidth(window.innerWidth)
    }

    // Set initial windowWidth
    setWindowWidth(window.innerWidth)

    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [])

  const edgeSlideWidth = 16
  const getResponsiveGap = (
    minGapBetween = breakpoints.sm ? 44 : 16,
    maxSlideWidth = 854
  ): number =>
    Math.max(
      minGapBetween,
      (windowWidth - maxSlideWidth - edgeSlideWidth * 2) / 2
    )

  const [gapBetweenSlides, setGapBetween] = useState(getResponsiveGap())

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
      fontSize: 'large',
      sx: { display: { xs: 'none', xl: 'block' } }
    })
    const NavigationContainer =
      variant === 'Left' ? LeftNavigationContainer : RightNavigationContainer

    return (
      <NavigationContainer
        data-testid={`${variant.toLowerCase()}NavContainer`}
        sx={{
          ...alignSx,
          position: 'absolute',
          top: 0,
          bottom: 0,
          zIndex: 2,
          display: slideTransitioning ? 'none' : 'flex',
          width: `${2 * edgeSlideWidth + gapBetweenSlides}px`
        }}
      >
        <IconButton
          data-testid={`conductor${variant}Button`}
          onClick={handleNext}
          disabled={variant === 'Left' ? disableLeftButton : disableRightButton}
          disableRipple
          sx={{ color: 'text.primary', px: 13 }}
        >
          {icon}
        </IconButton>
      </NavigationContainer>
    )
  }

  return (
    <Div100vh>
      <Stack
        sx={{
          justifyContent: 'center',
          height: '100%'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexGrow: 1,
            pt: { md: 0, xs: 6 },
            my: 'auto',
            [theme.breakpoints.only('sm')]: {
              maxHeight: '460px'
            },
            [theme.breakpoints.up('md')]: {
              maxHeight: '480px'
            }
          }}
        >
          <Swiper
            dir={!rtl ? 'ltr' : 'rtl'}
            slidesPerView="auto"
            centeredSlides
            centeredSlidesBounds
            onSwiper={(swiper) => setSwiper(swiper)}
            resizeObserver
            onBeforeResize={() => setGapBetween(getResponsiveGap())}
            onSlideChangeTransitionStart={() => setSlideTransitioning(true)}
            onSlideChangeTransitionEnd={() => setSlideTransitioning(false)}
            allowTouchMove={false}
            style={{
              width: '100%',
              paddingLeft: `${edgeSlideWidth + gapBetweenSlides / 2}px`,
              paddingRight: `${edgeSlideWidth + gapBetweenSlides / 2}px`
            }}
          >
            {treeBlocks.map((block) => (
              <SwiperSlide
                key={block.id}
                style={{
                  marginRight: '0px'
                }}
              >
                <Box
                  sx={{
                    px: `${gapBetweenSlides / 2}px`,
                    height: `calc(100% - ${theme.spacing(6)})`,
                    [theme.breakpoints.up('lg')]: {
                      maxWidth: '854px'
                    }
                  }}
                >
                  <CardWrapper
                    id={block.id}
                    backgroundColor={theme.palette.primary.light}
                    themeMode={null}
                    themeName={null}
                  >
                    <Fade
                      in={activeBlock?.id === block.id}
                      mountOnEnter
                      unmountOnExit
                    >
                      <Box
                        sx={{
                          position: 'absolute',
                          width: '100%',
                          height: '100%'
                        }}
                      >
                        <BlockRenderer block={block} />
                      </Box>
                    </Fade>
                  </CardWrapper>
                </Box>
              </SwiperSlide>
            ))}
            {showLeftButton && <Navigation variant="Left" />}
            {showRightButton && <Navigation variant="Right" />}
          </Swiper>
        </Box>
        <Box
          sx={{
            px: `${edgeSlideWidth + gapBetweenSlides}px`,
            pb: 2
          }}
        >
          <Footer />
        </Box>
      </Stack>
    </Div100vh>
  )
}
