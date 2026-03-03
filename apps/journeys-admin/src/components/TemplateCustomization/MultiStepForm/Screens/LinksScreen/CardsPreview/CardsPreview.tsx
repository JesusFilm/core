import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import take from 'lodash/take'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'
import { A11y, FreeMode, Mousewheel } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

import { TreeBlock } from '@core/journeys/ui/block'
import { BlockRenderer } from '@core/journeys/ui/BlockRenderer'
import { CardWrapper } from '@core/journeys/ui/CardWrapper'
import { FramePortal } from '@core/journeys/ui/FramePortal'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { getJourneyRTL } from '@core/journeys/ui/rtl'
import { InformationButton } from '@core/journeys/ui/StepHeader/InformationButton'
import { VideoWrapper } from '@core/journeys/ui/VideoWrapper'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'

import {
  BlockFields_CardBlock as CardBlock,
  BlockFields_StepBlock as StepBlock
} from '../../../../../../../__generated__/BlockFields'
import {
  ThemeMode,
  ThemeName
} from '../../../../../../../__generated__/globalTypes'

interface CardsPreviewProps {
  steps: Array<TreeBlock<StepBlock>>
  onCardClick?: (step: TreeBlock<StepBlock>) => void
  showTitle?: boolean
}

interface CardsPreviewItemProps {
  step: TreeBlock<StepBlock>
  onClick?: (step: TreeBlock<StepBlock>) => void
  stepIndex: number
  stepsCount: number
  showTitle?: boolean
}

const StyledSwiperSlide = styled(SwiperSlide)(() => ({}))
const StyledSwiper = styled(Swiper)(() => ({}))

// Unified base dimensions (same at all breakpoints)
const CONTAINER_WIDTH = 140

// Frame dimensions for the unscaled card
const FRAME_WIDTH = 445
const FRAME_HEIGHT = 773

// Derived scaling and height so frame fits container
const IFRAME_SCALE = CONTAINER_WIDTH / FRAME_WIDTH
const CONTAINER_HEIGHT = Math.round(FRAME_HEIGHT * IFRAME_SCALE)

// Spacing and offsets
const EDGE_FADE_PX = 16

function CardsPreviewItem({
  step,
  onClick,
  stepIndex,
  stepsCount,
  showTitle
}: CardsPreviewItemProps): ReactElement {
  const { journey } = useJourney()
  const { rtl, locale } = getJourneyRTL(journey)
  const cardBlock = step.children.find(
    (child) => child.__typename === 'CardBlock'
  ) as TreeBlock<CardBlock>

  return (
    <Box
      onClick={onClick != null ? () => onClick(step) : undefined}
      sx={{
        position: 'relative',
        width: CONTAINER_WIDTH,
        height: CONTAINER_HEIGHT,
        backgroundColor: 'background.default',
        borderRadius: 3,
        cursor: onClick != null ? 'pointer' : undefined
      }}
      data-testid="CardsPreviewItem"
    >
      <Box
        sx={{
          transform: `scale(${IFRAME_SCALE})`,
          transformOrigin: 'top left'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            display: 'block',
            width: FRAME_WIDTH,
            height: FRAME_HEIGHT,
            zIndex: 2,
            cursor: onClick != null ? 'pointer' : 'grab'
          }}
        />
        <FramePortal
          sx={{
            width: FRAME_WIDTH,
            height: FRAME_HEIGHT
          }}
          dir={rtl ? 'rtl' : 'ltr'}
        >
          <ThemeProvider
            themeName={cardBlock?.themeName ?? ThemeName.base}
            themeMode={cardBlock?.themeMode ?? ThemeMode.dark}
            rtl={rtl}
            locale={locale}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                width: '100%',
                zIndex: 1
              }}
            >
              <Stack
                direction="row"
                justifyContent="center"
                alignItems="center"
                sx={{
                  position: 'absolute',
                  top: 13,
                  width: '100%'
                }}
              >
                {Array.from({ length: stepsCount }).map((_, i) => {
                  const distance = Math.abs(i - stepIndex)
                  const size =
                    distance === 0
                      ? 8
                      : distance === 1
                        ? 6
                        : distance === 2
                          ? 4
                          : 3
                  const opacity =
                    distance === 0
                      ? 1
                      : distance === 1
                        ? 0.6
                        : distance === 2
                          ? 0.4
                          : 0.25
                  return (
                    <Box
                      key={i}
                      sx={{
                        width: size,
                        height: size,
                        borderRadius: '50%',
                        mx: '3px',
                        backgroundColor: 'primary.main',
                        opacity,
                        transition: 'width 0.2s, height 0.2s, opacity 0.2s'
                      }}
                    />
                  )
                })}
              </Stack>
              <InformationButton sx={{ px: 6, float: 'right' }} />
            </Box>
            <Box
              sx={{
                height: '100%',
                borderRadius: 4
              }}
            >
              <BlockRenderer
                block={step}
                wrappers={{
                  VideoWrapper,
                  CardWrapper
                }}
              />
            </Box>
            {showTitle === true && journey?.title != null && (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  zIndex: 1,
                  pl: 4,
                  pr: 6,
                  py: 2
                }}
              >
                <Typography
                  variant="overline"
                  sx={{
                    color: 'primary.main',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: 'block',
                    fontSize: '7px',
                    lineHeight: 1.4,
                    letterSpacing: '0.5px'
                  }}
                >
                  {journey.title}
                </Typography>
              </Box>
            )}
          </ThemeProvider>
        </FramePortal>
      </Box>
    </Box>
  )
}

export function CardsPreview({
  steps,
  onCardClick,
  showTitle
}: CardsPreviewProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  const slidesToRender: Array<TreeBlock<StepBlock>> = take(steps, 7)

  if (steps.length === 0) {
    return (
      <Stack
        data-testid="CardsPreviewPlaceholder"
        direction="row"
        sx={{ overflowY: 'visible' }}
      >
        <Skeleton
          variant="rounded"
          data-testid="CardsPreviewSkeleton"
          sx={{
            minWidth: CONTAINER_WIDTH,
            height: CONTAINER_HEIGHT,
            borderRadius: 2
          }}
        />
      </Stack>
    )
  }

  return (
    <StyledSwiper
      modules={[Mousewheel, FreeMode, A11y]}
      mousewheel={{
        forceToAxis: true
      }}
      freeMode
      watchOverflow
      centerInsufficientSlides
      slidesPerView="auto"
      spaceBetween={12}
      slidesOffsetBefore={EDGE_FADE_PX}
      observer
      observeParents
      sx={{
        pr: 2,
        overflow: 'hidden',
        zIndex: 2,
        height: CONTAINER_HEIGHT + 15,
        width: '100%',
        maskImage: `linear-gradient(to right, rgba(0,0,0,0) 0, rgba(0,0,0,1) ${EDGE_FADE_PX}px, rgba(0,0,0,1) calc(100% - ${EDGE_FADE_PX}px), rgba(0,0,0,0) 100%)`,
        WebkitMaskImage: `linear-gradient(to right, rgba(0,0,0,0) 0, rgba(0,0,0,1) ${EDGE_FADE_PX}px, rgba(0,0,0,1) calc(100% - ${EDGE_FADE_PX}px), rgba(0,0,0,0) 100%)`
      }}
    >
      {slidesToRender.map((step, index) => (
        <StyledSwiperSlide
          data-testid="CardsSwiperSlide"
          key={step.id}
          sx={{
            zIndex: 2,
            width: 'unset !important'
          }}
        >
          <CardsPreviewItem
            step={step}
            onClick={onCardClick}
            stepIndex={index}
            stepsCount={slidesToRender.length}
            showTitle={showTitle}
          />
        </StyledSwiperSlide>
      ))}
      {steps.length > slidesToRender.length && (
        <StyledSwiperSlide
          data-testid="CardsRemainingSlide"
          sx={{
            width: 'unset !important',
            cursor: 'grab',
            zIndex: 2
          }}
        >
          <Stack
            alignItems="center"
            justifyContent="center"
            gap={2}
            sx={{
              width: CONTAINER_WIDTH,
              height: CONTAINER_HEIGHT,
              borderRadius: 2,
              backgroundColor: 'secondary.main',
              px: 1
            }}
          >
            <Typography
              variant="overline2"
              color="background.paper"
              textAlign="center"
            >
              {t('{{count}} more cards', {
                count: steps.length - slidesToRender.length
              })}
            </Typography>
          </Stack>
          <Box
            sx={{
              position: 'relative',
              bottom: CONTAINER_HEIGHT - 5,
              left: 10,
              zIndex: -1,
              minWidth: CONTAINER_WIDTH,
              height: CONTAINER_HEIGHT,
              borderRadius: 2,
              backgroundColor: 'secondary.light'
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              left: 21,
              top: 11,
              zIndex: -2,
              minWidth: CONTAINER_WIDTH,
              height: CONTAINER_HEIGHT,
              borderRadius: 2,
              backgroundColor: 'divider'
            }}
          />
        </StyledSwiperSlide>
      )}
    </StyledSwiper>
  )
}
