import { ReactElement, useEffect, useState } from 'react'
import SwiperCore from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import { findIndex } from 'lodash'
import Box from '@mui/material/Box'
import Fade from '@mui/material/Fade'
import Stack from '@mui/material/Stack'
import IconButton from '@mui/material/IconButton'
import { useTheme } from '@mui/material/styles'
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
// Used to resolve dynamic viewport height on Safari
import Div100vh from 'react-div-100vh'
import { v4 as uuidv4 } from 'uuid'
import TagManager from 'react-gtm-module'
import last from 'lodash/last'
import { JourneyViewEventCreate } from '../../../__generated__/JourneyViewEventCreate'
import { Footer } from '../Footer'

export const JOURNEY_VIEW_EVENT_CREATE = gql`
  mutation JourneyViewEventCreate($input: JourneyViewEventCreateInput!) {
    journeyViewEventCreate(input: $input) {
      id
    }
  }
`

export interface ConductorProps {
  blocks: TreeBlock[]
}

export function Conductor({ blocks }: ConductorProps): ReactElement {
  const { setTreeBlocks, nextActiveBlock, treeBlocks, activeBlock } =
    useBlocks()
  const [swiper, setSwiper] = useState<SwiperCore>()
  const [showNavArrows, setShowNavArrow] = useState(true)
  const breakpoints = useBreakpoints()
  const theme = useTheme()
  const { journey, admin } = useJourney()
  const lastStep = last(treeBlocks)

  const [journeyViewEventCreate] = useMutation<JourneyViewEventCreate>(
    JOURNEY_VIEW_EVENT_CREATE
  )

  useEffect(() => {
    if (!admin && journey != null) {
      const id = uuidv4()
      void journeyViewEventCreate({
        variables: {
          input: { id, journeyId: journey.id }
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
            py: { sm: 0, xs: 6 },
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
            slidesPerView="auto"
            centeredSlides
            centeredSlidesBounds
            onSwiper={(swiper) => setSwiper(swiper)}
            resizeObserver
            onBeforeResize={() => setGapBetween(getResponsiveGap())}
            onSlideChangeTransitionStart={() => setShowNavArrow(false)}
            onSlideChangeTransitionEnd={() => setShowNavArrow(true)}
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
            {activeBlock !== treeBlocks[0] && (
              <IconButton
                data-testid="conductorPrevButton"
                onClick={handleNext}
                disabled
                disableRipple
                sx={{
                  display: showNavArrows ? 'flex' : 'none',
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  zIndex: 2,
                  left: 0,
                  width: `${2 * edgeSlideWidth + gapBetweenSlides}px`,
                  pl: ` ${gapBetweenSlides - 100}px`,
                  color: (theme) => theme.palette.text.primary
                }}
              >
                <ChevronLeftIcon
                  fontSize="large"
                  sx={{
                    display: 'none',
                    [theme.breakpoints.only('xl')]: {
                      display: 'block'
                    }
                  }}
                />
              </IconButton>
            )}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                zIndex: 2,
                right: 0,
                background: (theme) => theme.palette.background.default,
                transition: 'opacity 0.5s ease-out',
                opacity: activeBlock?.nextBlockId != null ? 0 : 1,
                width: (theme) => theme.spacing(4)
              }}
            />
            {activeBlock !== lastStep && (
              <IconButton
                data-testid="conductorNextButton"
                onClick={handleNext}
                disabled={
                  activeBlock?.locked === true || lastStep === activeBlock
                }
                disableRipple
                sx={{
                  display: showNavArrows ? 'flex' : 'none',
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  zIndex: 2,
                  right: 0,
                  width: `${2 * edgeSlideWidth + gapBetweenSlides}px`,
                  pr: ` ${gapBetweenSlides - 100}px`,
                  color: (theme) => theme.palette.text.primary
                }}
              >
                <ChevronRightIcon
                  fontSize="large"
                  sx={{
                    display: 'none',
                    [theme.breakpoints.only('xl')]: {
                      display: 'block'
                    }
                  }}
                />
              </IconButton>
            )}
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
